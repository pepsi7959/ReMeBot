#!/usr/bin/python3
# -*- coding: utf-8 -*-

"""
MIT License

Copyright (c) 2020 Narongsak Mala

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""

import socket
import urllib.request
import xml.etree.ElementTree as ET
import datetime
import pymysql

# Global Configuration
# URL to scrap the data
URL = 'https://intranet.dga.or.th/mis/MeetingRoom/scripts/ShowDetail.asp'

# timeout to query
timeout = 5


def getURL(ID):
    return URL + "?ID=" + str(ID)


def scrap(url):
    # setting up
    socket.setdefaulttimeout(timeout)

    try:
        req = urllib.request.Request(URL + '?ID=' + str(ID))
        res = urllib.request.urlopen(req)
        data = res.read()
        return data
    except urllib.error.HTTPError as e:
        print(e)
        return ""


def cleanUp(data):
    data = data.decode("tis-620")
    data = data.replace("&nbsp;", "")
    data = data.replace("<BR>", "")
    return data


def getHTTPBody(data):
    b_start = bytes("<BODY>", 'utf-8')
    b_end = bytes("</BODY>", 'utf-8')
    idx_start = data.find(b_start) + 6
    idx_end = data.find(b_end)
    body = data[idx_start:idx_end]
    return cleanUp(body)


def getMonth(s):
    if s == u'ม.ค.':
        return 1
    if s == u'ก.พ.':
        return 2
    if s == u'มี.ค.':
        return 3
    if s == u'เม.ย.':
        return 4
    if s == u'พ.ค.':
        return 5
    if s == u'มิ.ย.':
        return 6
    if s == u'ก.ค.':
        return 7
    if s == u'ส.ค.':
        return 8
    if s == u'ก.ย.':
        return 9
    if s == u'ต.ค.':
        return 10
    if s == u'พ.ย.':
        return 11
    if s == u'ธ.ค.':
        return 12
    else:
        return 0


def getStartTime(s):
    d = s.split(" ")
    t = d[4].split(":")
    return datetime.datetime(int(d[2])-543, getMonth(d[1]), int(d[0]), int(t[0]), int(t[1]))


def getEndTime(s):
    d = s.split(" ")
    t = d[6].split(":")
    return datetime.datetime(int(d[2])-543, getMonth(d[1]), int(d[0]), int(t[0]), int(t[1]))


def decode(data):
    # convert to UTF-8

    # decode
    store = []
    # print(data.decode('tis-620'))
    idx_last = len(data) - 1
    print("content len: " + str(idx_last))
    idx_cur = 0
    breaker = 0

    while (idx_cur < idx_last) and breaker < 15:
        # find <TD>...</TD>
        td_start = data.find("<TD", idx_cur) + 3
        if td_start < idx_cur:
            break
        idx_cur = td_start
        td_start = data.find(">", idx_cur) + 1
        idx_cur = td_start
        td_end = data.find("</TD>", idx_cur)
        idx_cur = td_end + 4
        content = data[td_start:td_end]
        print(str(breaker) + ") content: " + content)
        store.append(content)
        breaker += 1
    return store


def saveToDatabase(record):

    db = pymysql.connect("127.0.0.1", "root", "Acho20mkr", "remebot")
    cursor = db.cursor()

    #sql = """SELECT * FROM remebot.MeetingRoom;"""

    sql = f"INSERT INTO remebot.MeetingRoom(id, room, meeting_begin, meeting_end, reserver, internal_tel, division, agenda) values({record['id']}, {record['room']}, \"{record['meeting_begin']}\", \"{record['meeting_end']}\", \"{record['reserver']}\", {record['internal_tel']}, \"{record['division']}\", \"{record['agenda']}\")"

    print(sql)
    try:
        cursor.execute(sql)
        db.commit()
    except pymysql.DatabaseError as e:
        print(f"SQL Error: {e}")
        db.rollback()
    db.close()


ID = 44729  # the last reserved
data = scrap(getURL(ID))
body = getHTTPBody(data)
contents = decode(body)
record = {"id": ID,
          "room": contents[2].split(" ", 1)[0],
          "meeting_begin": getStartTime(contents[4]).isoformat(),
          "meeting_end": getEndTime(contents[4]).isoformat(),
          "reserver": contents[6],
          "internal_tel": contents[8],
          "division": contents[10],
          "agenda": contents[12]
          }
print(record)
saveToDatabase(record)
