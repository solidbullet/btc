#!/usr/bin/env python3
from time import time
import hmac
import hashlib

import requests
from retrying import retry

API_V1_1 = 'v1.1'
API_V2_0 = 'v2.0'

BASE_URL = 'https://bittrex.com/api/{version}/{method}?{paramvalue}'

class Bittrex(object):
	def __init__ (self, api_ver):
		self._api_ver = api_ver
		self._ReqUrlDict = dict ()

	@retry(stop_max_attempt_number=3)
	def get_json (self, url, sign = None):
		#print 'bittrex request start'
		raw_dict = requests.get (url,timeout=3).json() if sign is None else requests.get(url, headers = {'apisign': sign},timeout=3).json()
		#print 'bittrex request done'
		if raw_dict ['success'] is True:
			return True, raw_dict['result'] 
		else:
			return False, raw_dict['message']
	
	@staticmethod
	def get_nonce ():
		return str(int(time() * 1000))

	@staticmethod
	def hmac_sign (msg_str, secret_bytes):
		return hmac.new (secret_bytes, msg_str.encode('utf-8'), hashlib.sha512).hexdigest()

class PublicAPI(Bittrex):
	def __init__ (self, api_ver):
		Bittrex.__init__ (self, api_ver)
		if api_ver == API_V1_1:
			self._ReqUrlDict = {'GET_MARKETS'	: BASE_URL.format (version = self._api_ver, method = 'public/getmarkets', paramvalue = '') [:-1],
				'GET_CURRENCIES'  : BASE_URL.format (version = self._api_ver, method = 'public/getcurrencies', paramvalue = '') [:-1],
				'GET_TICKER'	: BASE_URL.format (version = self._api_ver, method = 'public/getticker', paramvalue = 'market={mar}'),
				'GET_24HSUMALL'	: BASE_URL.format (version = self._api_ver, method = 'public/getmarketsummaries', paramvalue = '') [:-1],
				'GET_24HSUM'		 : BASE_URL.format (version = self._api_ver, method = 'public/getmarketsummary', paramvalue = 'market={mar}'),
				'GET_ORDERBOOK'  : BASE_URL.format (version = self._api_ver, method = 'public/getorderbook', paramvalue = 'market={mar}&type={typ}'),
				'GET_HISTORY'		: BASE_URL.format (version = self._api_ver, method = 'public/getmarketsummary', paramvalue = 'market={mar}'),
			  }
		elif api_ver == API_V2_0:
			self._ReqUrlDict = {'GET_BTC_PRICE': BASE_URL.format (version = self._api_ver, method = 'pub/currencies/GetBTCPrice', paramvalue = '')[:-1],
								'GET_TICKS': BASE_URL.format (version = self._api_ver, method = 'pub/market/GetTicks', paramvalue = 'marketName={mar}&tickInterval={itv}'),
								'GET_LATESTTICK': BASE_URL.format (version = self._api_ver, method = 'pub/market/GetLatestTick', paramvalue = 'marketName={mar}&tickInterval={itv}'),
							   }

	# These functions are dedicated for API_V1_1
	def get_markets (self):
		reqUrl = self._ReqUrlDict['GET_MARKETS']
		return self.get_json (reqUrl)

	def get_currencies (self):
		reqUrl = self._ReqUrlDict['GET_CURRENCIES']
		return self.get_json (reqUrl)

	def get_ticker (self, market):
		reqUrl = self._ReqUrlDict['GET_TICKER'].format (mar = market)
		return self.get_json (reqUrl)

	def get_24h_sum (self, market = ''):
		reqUrl = self._ReqUrlDict['GET_24HSUMALL'] if market is '' else self._ReqUrlDict['GET_24HSUM'].format (mar = market)
		return self.get_json (reqUrl)

	def get_order_book (self, market):
		reqUrl = self._ReqUrlDict['GET_ORDERBOOK'].format (mar = market, typ = 'both')
		return self.get_json (reqUrl)

	def get_history (self, market):
		reqUrl = self._ReqUrlDict['GET_HISTORY'].format (mar = market)
		return self.get_json (reqUrl)

	# These functions are dedicated for API_V2_0
	def get_btc_price (self):
		reqUrl = self._ReqUrlDict['GET_BTC_PRICE']
		return self.get_json (reqUrl)

	def get_ticks (self, market, interval, only_lastest = False):
		"""
		interval supports only ['oneMin', 'fiveMin', 'thirtyMin', 'hour', 'day']
		"""
		if only_lastest:
			reqUrl = self._ReqUrlDict['GET_LATESTTICK'].format (mar=market, itv = interval)
		else:
			reqUrl = self._ReqUrlDict['GET_TICKS'].format (mar=market, itv = interval)
		return self.get_json (reqUrl)


	def get_depth(self,symbol,layers,inner_layer=0):
		depth = self.get_order_book(symbol)[1]
		if 'buy' in depth and 'sell' in depth:
			bitrex_depth = {'asks':depth['sell'][inner_layer:layers],'bids':depth['buy'][inner_layer:layers]}
			return bitrex_depth
		else:
			return depth

	def get_outer_layers(self,symbol,inner_layer):
		depth = self.get_order_book(symbol)[1]
		if 'buy' in depth and 'sell' in depth:
			if len(depth['buy'])>inner_layer and len(depth['sell'])>inner_layer :
				bitrex_depth={'asks':depth['sell'][inner_layer:],'bids':depth['buy'][inner_layer:]}
				return bitrex_depth

	def get_symbol_info(self,symbol):
		status,markets= self.get_markets()
		if status:
			for list in markets:
				if list['MarketName']==symbol.upper():
					print list
					symbol_info = {'price_precise': 8,
								   'amount_precise': 3,
								   'minsize': float(list['MinTradeSize'])}
					return symbol_info

	def get_ticker_last(self,symbol):
		status,tick= self.get_ticker(symbol)
		if status:
			if tick:
				print tick
				if 'Last' in tick:
					return tick['Last']




class MarketAPI(Bittrex):
	def __init__ (self, api_ver, api_key, api_secret):
		Bittrex.__init__ (self, api_ver)
		self._api_key = api_key
		self._secret = api_secret
		self._ReqUrlDict ['BUY_LIMIT']	  = BASE_URL.format (version = self._api_ver, method = 'market/buylimit', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&market={mar}&quantity={qty}&rate={rate}')
		self._ReqUrlDict ['SELL_LIMIT']	 = BASE_URL.format (version = self._api_ver, method = 'market/selllimit', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&market={mar}&quantity={qty}&rate={rate}')
		self._ReqUrlDict ['CANCEL']	= BASE_URL.format (version = self._api_ver, method = 'market/cancel', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&uuid={o_uuid}')
		self._ReqUrlDict ['GET_OPENORDERS']	  = BASE_URL.format (version = self._api_ver, method = 'market/getopenorders', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&market={mar}')
		self._ReqUrlDict ['GET_OPENALLORDERS'] = BASE_URL.format (version = self._api_ver, method = 'market/getopenorders', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}')

	def buy_limit (self, market, quantity, rate):
		nonce = self.get_nonce ()
		reqUrl = self._ReqUrlDict ['BUY_LIMIT'].format (no = nonce, mar = market, qty = quantity, rate = rate)
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))

	def sell_limit (self, market, quantity, rate):
		nonce = self.get_nonce ()
		reqUrl = self._ReqUrlDict ['SELL_LIMIT'].format (no = nonce, mar = market, qty = quantity, rate = rate)
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))

	def cancel (self, uuid):
		nonce = self.get_nonce ()
		reqUrl = self._ReqUrlDict ['CANCEL'].format (no = nonce, o_uuid = uuid)
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))
	
	def get_open_orders (self, market = ''):
		nonce = self.get_nonce ()
		reqUrl = self._ReqUrlDict ['GET_OPENORDERS'].format (no = nonce, mar = market) if market is not '' else self._ReqUrlDict['GET_OPENALLORDERS'].format(no = nonce) 
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))

class AccountAPI(Bittrex):
	def __init__ (self, api_ver, api_key, api_secret):
		Bittrex.__init__ (self, api_ver)
		self._api_key = api_key
		self._secret = api_secret
		self._ReqUrlDict ['GET_BALANCES']	 = BASE_URL.format (version = self._api_ver, method = 'account/getbalances', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}')
		self._ReqUrlDict ['GET_BALANCE']	= BASE_URL.format (version = self._api_ver, method = 'account/getbalance', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&currency={cur}')
		self._ReqUrlDict ['GET_DEPOSITADDR']	 = BASE_URL.format (version = self._api_ver, method = 'account/getdepositaddress', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&currency={cur}')
		self._ReqUrlDict ['WITHDRAW_NOPID']	 = BASE_URL.format (version = self._api_ver, method = 'account/withdraw', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&currency={cur}&quantity={qty}&address={addr}')
		self._ReqUrlDict ['WITHDRAW']	 = BASE_URL.format (version = self._api_ver, method = 'account/withdraw', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&currency={cur}&quantity={qty}&address={addr}&paymentid={pid}')
		self._ReqUrlDict ['GET_ORDER']	= BASE_URL.format (version = self._api_ver, method = 'account/getorder', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&uuid={o_uuid}')
		self._ReqUrlDict ['GET_ALLORDERHIS']	  = BASE_URL.format (version = self._api_ver, method = 'account/getorderhistory', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}')
		self._ReqUrlDict ['GET_ORDERHIS']	 = BASE_URL.format (version = self._api_ver, method = 'account/getorderhistory', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&market={mar}')
		self._ReqUrlDict ['GET_WITHDRAWALHIS'] = BASE_URL.format (version = self._api_ver, method = 'account/getwithdrawalhistory', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&currency={cur}')
		self._ReqUrlDict ['GET_DEPOSITHIS']		= BASE_URL.format (version = self._api_ver, method = 'account/getdeposithistory', paramvalue = 'apikey=' + self._api_key.decode() + '&nonce={no}&currency={cur}')

	def get_balance (self, cur = ''):
		nonce = self.get_nonce()
		reqUrl = self._ReqUrlDict['GET_BALANCES'].format(no = nonce) if cur is '' else self._ReqUrlDict['GET_BALANCE'].format (no = nonce, cur = cur)
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))

	def get_deposit_addr (self, cur):
		nonce = self.get_nonce ()
		reqUrl = self._ReqUrlDict ['GET_DEPOSITADDR'].format (no = nonce, cur = cur)
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))

	def withdraw (self, cur,  qty, addr, pid = None):
		nonce = self.get_nonce ()
		if pid is None:
			reqUrl = self._ReqUrlDict ['WITHDRAW_NOPID'].format (no = nonce, cur = cur, qty = qty, addr = addr)
		else:
			reqUrl = self._ReqUrlDict ['WITHDRAW'].format (no = nonce, cur = cur, qty = qty, addr = addr, pid = pid)
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))

	def get_order (self, uuid):
		nonce = self.get_nonce()
		reqUrl = self._ReqUrlDict ['GET_ORDER'].format (no = nonce, o_uuid = uuid)
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))

	def get_order_history (self, market = ''):
		nonce = self.get_nonce ()
		reqUrl = self._ReqUrlDict ['GET_ALLORDERHIS'].format (no = nonce) if market is '' else self._ReqUrlDict ['GET_ORDERHIS'].format (no = nonce, mar = market)
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))

	def get_withdrawal_history (self, cur):
		nonce = self.get_nonce ()
		reqUrl = self._ReqUrlDict ['GET_WITHDRAWALHIS'].format (no = nonce, cur = cur)
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))

	def get_deposit_history (self, cur):
		nonce = self.get_nonce ()
		reqUrl = self._ReqUrlDict ['GET_DEPOSITHIS'].format (no = nonce, cur = cur)
		return self.get_json (reqUrl, self.hmac_sign (reqUrl, self._secret))







if __name__ == '__main__':

	bitrex_rest = PublicAPI(API_V1_1)
	