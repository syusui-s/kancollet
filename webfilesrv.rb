#! ruby -Ku
# coding: utf-8
require 'webrick'

server = WEBrick::HTTPServer.new(:Port => 12345)

server.mount('/', WEBrick::HTTPServlet::FileHandler, Dir.pwd, {:FancyIndexing => true})

trap(:INT){server.shutdown}
server.start
