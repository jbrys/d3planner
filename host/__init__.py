__author__ = 'seanseymour'

import cherrypy
from mako.lookup import TemplateLookup


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
		return self._get_template("index.html").render(base=self._relative_base)

	@cherrypy.expose
	def js(self):
		return self._get_template("js/d3planner.js").render(base=self._relative_base)

	@cherrypy.expose
	def json(self, path):
		path = "/".join(["js/json/", path + ".json"])
		print path
		return self._get_template(path).render()

	@cherrypy.expose
	def css(self):
		return self._get_template("css/d3planner.css").render(base=self._relative_base)