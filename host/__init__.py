__author__ = 'seanseymour'

import cherrypy
from mako.lookup import TemplateLookup
import urllib


class Host(object):
	_template_dir = None
	_relative_base = None

	def __init__(self, config):
		self._template_dir = config.get("host", "template_dir")
		self._relative_base = config.get("host", "relative_base")
		self._lookup = TemplateLookup(directories=[self._template_dir])
		return

	def _get_template(self, template):
		return self._lookup.get_template(template)

	@cherrypy.expose
	def index(self):
		cherrypy.response.headers["Allow"] = "POST, GET"
		cherrypy.response.headers["Access-Control-Request-Headers"] = "x-requested-with"
		cherrypy.response.headers["Access-Control-Allow-Origin"] = "*"
		cherrypy.response.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept"
		return self._get_template("index.html").render(base=self._relative_base)

	@cherrypy.expose
	def json(self, path):
		path = "/".join(["js/json/", path + ".json"])
		return self._get_template(path).render()

	@cherrypy.expose
	def bnet_profile(self, name, number):
		url = "http://us.battle.net/api/d3/profile/{0}-{1}/".format(name, number)
		return urllib.urlopen(url)

	@cherrypy.expose
	def character_profile(self, name, number, char_id):
		url = "http://us.battle.net/api/d3/profile/{0}-{1}/hero/{2}".format(name, number, char_id)
		return urllib.urlopen(url)

	@cherrypy.expose
	def item_details(self, item_id):
		url = "http://us.battle.net//api/d3/data/item/{0}".format(item_id)
		return urllib.urlopen(url)