__author__ = 'seanseymour'

import cherrypy
import os
from mako.lookup import TemplateLookup
from cherrypy.lib.static import serve_file

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
    def json(self, path):
        path = "/".join(["js/json/", path + ".json"])
        return self._get_template(path).render()
