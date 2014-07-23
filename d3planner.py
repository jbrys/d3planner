#!/usr/bin/env python

import cherrypy
import ConfigParser
from host import Host
import os
import inspect

os.chdir(os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe()))))

config = ConfigParser.SafeConfigParser()
config.read(['d3planner.cfg'])

app_config = {
    '/': {},
    '/css': {
        'tools.staticdir.on': True,
        'tools.staticdir.dir': os.path.join(os.path.abspath('template/css'))
    },
    '/js': {
        'tools.staticdir.on': True,
        'tools.staticdir.dir': os.path.join(os.path.abspath('template/js'))
    }
}

default_config_values = {
    "host": {
        "host": "0.0.0.0",
        "max_threads": 100,
        "port": 8079,
        "template_dir": "template",
        "relative_base": "/"
    }
}

save = False
for section in default_config_values.keys():
    if not config.has_section(section):
        config.add_section(section)
        save = True

for option in default_config_values[section].keys():
    if not config.has_option(section, option):
        config.set(section, option, str(default_config_values[section][option]))
        save = True

if save:
    config.write(open('d3planner.cfg', 'w'))

cherrypy.config.update({
    'server.socket_host': config.get("host", "host")
    , 'server.socket_port': config.getint("host", "port")
    , 'thread_pool': config.getint("host", "max_threads")
})

cherrypy.tree.mount(Host(config), '/', config=app_config)
cherrypy.engine.start()
cherrypy.engine.block()