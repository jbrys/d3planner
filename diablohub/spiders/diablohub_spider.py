from scrapy.contrib.spiders import CrawlSpider, Rule
from scrapy.contrib.linkextractors import LinkExtractor
from scrapy.http import Request
from diablohub.items import LegendaryItem


CACHED_URL = 'http://webcache.googleusercontent.com/search?q=cache:http://www.diablohub.com'
#URL = CACHED_URL
URL = 'http://www.diablohub.com'


class DiablohubSpider(CrawlSpider):

	name = 'diablohub'
	allowed_domains = ['diablohub.com', 'googleusercontent.com']
	start_urls = [URL + '/database?page=%d' % i for i in xrange(22)]
	rules = [Rule(LinkExtractor(allow=['/item/.+'], deny=['forum/.+']), callback='parse_legendary', follow=True)]

# This stuff is dumb and doesn't work. It's mostly being a tryhard and not understanding how Rules worked.

	# def parse_pages(self, response):
	# 	page_numbers = response.xpath('//ul[@class="pagination"]').re('(?:page)*\d+')
	# 	page_numbers = map(int, page_numbers)
	# 	max_pages = max(page_numbers)
	# 	for page in range(2, max_pages):
	# 		req = Request(URL + '/database?page=' + str(page), callback=self.parse_links)
	# 		yield req
	# 		print "BOOYA"

	# def parse_links(self, response):
	# 	print '!!!!!!PARSE LINKS!!!!!!'
	# 	links = response.xpath('//th[@class="hidden-xs"]/a[1]')
	# 	for link in links:
	# 		path = link.xpath('./@href').extract()
	# 		url = URL + path[0]
	# 		req = Request(url, callback=self.parse_legendary, )
	# 		yield req

	def parse_legendary(self, response):
		legendary = LegendaryItem()
		legendary['url'] = response.url
		legendary['name'] = response.xpath('//h2/text()').extract()
		legendary['item_type'] = response.xpath('//div[@class="col-md-8"]/text()').extract()
		legendary['leg_affix'] = response.xpath('//div[@class="col-md-8"]/p/text()').extract()
		#check if lvl 70
		if not response.xpath('//div[@id="lvl70"]'):
			legendary['primary'] = response.xpath('//h3[text()[contains(.,"Guaranteed Stats")]]/following::ul[2]/li').extract()
		else:
			legendary['primary'] = response.xpath('//div[@id="lvl70"]/ul[2]/li/text()').extract()
			legendary['secondary'] = response.xpath('//div[@id="lvl70"]/ul[3]/li/text()').extract()
		#legendary['ilvl70'] = response.xpath('//div[@id="lvl70"]').extract()
		yield legendary

