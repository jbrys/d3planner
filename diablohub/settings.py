# -*- coding: utf-8 -*-

# Scrapy settings for diablohub project
#
# For simplicity, this file contains only the most important settings by
# default. All the other settings are documented here:
#
#     http://doc.scrapy.org/en/latest/topics/settings.html
#

BOT_NAME = 'diablohub'

SPIDER_MODULES = ['diablohub.spiders']
NEWSPIDER_MODULE = 'diablohub.spiders'

DOWNLOAD_DELAY = 2.5

# Crawl responsibly by identifying yourself (and your website) on the user-agent
#USER_AGENT = 'diablohub (+http://www.yourdomain.com)'
