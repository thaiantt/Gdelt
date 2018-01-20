# coding: utf-8
from twisted.web.static import File
from twisted.web.server import Site
from autobahn.twisted.websocket import WebSocketServerProtocol
import json
from functions_api import *
from pymongo import MongoClient

# API
api = {'getAllHumanitarianEventsByRegionByYear': getAllHumanitarianEventsByRegionByYear,
       'getDifferentEventsByRegionByYear': getDifferentEventsByRegionByYear,
       'getDifferentEventsByRegionByMonthByYear': getDifferentEventsByRegionByMonthByYear,
       'getAllHumanitarianEventsByRegionByMonthByYear': getAllHumanitarianEventsByRegionByMonthByYear,
       'getCountDifferentEventsByCountryCodeByMonthByYear': getCountDifferentEventsByCountryCodeByMonthByYear,
       'getEventByCountryCodeByStartByEnd': getEventByCountryCodeByStartByEnd,
       'getCountDifferentEventsByCountryCodeByStartByEnd': getCountDifferentEventsByCountryCodeByStartByEnd,
       'getEventsByBrushByStartByEnd': getEventsByBrushByStartByEnd}


class MyServerProtocol(WebSocketServerProtocol):
    # def __init__(self, mdb):
    #     """
    #     Constructor
    #     :param mdb: a MongoDB database
    #     """
    #     self.db = mdb

    def onConnect(self, request):
        print("Client connecting: {}".format(request.peer))

    def onOpen(self):
        print("WebSocket connection open.")

    def onMessage(self, payload, isBinary):
        if isBinary:
            print("Binary message received: {} bytes".format(len(payload)))
        else:
            msg = handle_msg(payload)
            if msg:
                self.sendMessage(msg.encode('utf8'), False)

    def onClose(self, wasClean, code, reason):
        print("WebSocket connection closed: {}".format(reason))


def handle_msg(msg):
    request = json.loads(msg.decode('utf8'))
    print("Text message received")
    print("Request : " + request['fct'])

    # return api[request['fct']](request["args"])
    res = api[request['fct']](request["args"], database)
    dump = json.dumps({'data': res,
                       'args': request["args"],
                       'fct': request['fct']})

    return dump


if __name__ == '__main__':
    import sys

    # static file server seving index_old.html as root
    root = File(".")

    from twisted.python import log
    from twisted.internet import reactor

    log.startLogging(sys.stdout)

    from autobahn.twisted.websocket import WebSocketServerFactory

    # create a MongoClient to the running mongod instance
    client = MongoClient('localhost', 27017)

    # getting a Database
    database = client.test

    # create indexes
    create_indexes(database)

    factory = WebSocketServerFactory()
    factory.protocol = MyServerProtocol

    reactor.listenTCP(9000, factory)
    site = Site(root)
    reactor.listenTCP(8080, site)
    reactor.run()
