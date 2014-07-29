# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

import scrapy


class LegendaryItem(scrapy.Item):
    url = scrapy.Field()
    name = scrapy.Field()
    item_type = scrapy.Field()
    primary = scrapy.Field()
    secondary = scrapy.Field()
    leg_affix = scrapy.Field()
    #ilvl70 = scrapy.Field()
