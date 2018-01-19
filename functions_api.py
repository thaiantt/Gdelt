from pymongo import MongoClient, GEOSPHERE
from datetime import datetime


def getEventsByBrushByStartByEnd(args, db):
    """
    Get all events given a brush, a start date and an end date
    :param args: a brush, start_date, end_date
    :param db: MongoDB test database
    :return:
    """
    # get gdelt collection
    collection = db.gdelt

    # get brush and year
    brush_top_left = args[0]
    brush_bottom_right = args[1]

    brush_bottom_left = [float(brush_top_left[0]), float(brush_bottom_right[1])]
    brush_top_right = [float(brush_bottom_right[0]), float(brush_top_left[1])]

    # get dates
    start_date = int(args[2])

    end_date = int(args[3])

    match = {"$match": {"loc": {"$geoWithin": {"$box": [brush_bottom_left, brush_top_right]}},
                        "Day": {"$gte": start_date, "$lt": end_date}}}
    group = {
        "$group": {"_id": {"loc": "$loc", "eventCode": "$EventCode"}, "count": {"$sum": 1}}}
    result = collection.aggregate([match, group])

    return list(result)


def getEventByCountryCodeByStartByEndDate(args, db):
    """
    Get all events given a start date and an end date
    :param args: a region, start_date, end_date
    :param db: MongoDB test database
    :return:
    """
    # get gdelt collection
    collection = db.gdelt
    # collection = db.gdelt_date

    # get region and year
    r = args[0]

    # get dates
    start_str = args[1].split("-")
    start_date = datetime(int(start_str[0]), int(start_str[1]), int(start_str[2]))

    end_str = args[2].split("-")
    end_date = datetime(int(end_str[0]), int(end_str[1]), int(end_str[2]))

    # get region collection
    region = db[r]
    region.create_index([("geometry", GEOSPHERE)])

    zone = region.find_one()

    match = {"$match": {"loc": {"$geoWithin": {"$geometry": zone["geometry"]}},
                        "Day": {"$gte": start_date, "$lt": end_date}}}
    group = {
        "$group": {"_id": {"loc": "$loc", "Day": "$Day", "eventCode": "$EventCode"}, "count": {"$sum": 1}}}
    result = collection.aggregate([match, group])  # Group by monthyear (not day)

    return list(result)


def getEventByCountryCodeByStartByEnd(args, db):
    """
    Get all events given a start date and an end date
    :param args: a region, start_date, end_date
    :param db: MongoDB test database
    :return:
    """
    # get gdelt collection
    collection = db.gdelt

    # get region and year
    r = args[0]

    # get dates
    start_date = int(args[1])

    end_date = int(args[2])

    # get region collection
    region = db[r]
    # region.create_index([("geometry", GEOSPHERE)])

    zone = region.find_one()

    match = {"$match": {"loc": {"$geoWithin": {"$geometry": zone["geometry"]}},
                        "Day": {"$gte": start_date, "$lt": end_date}}}
    group = {
        "$group": {"_id": {"loc": "$loc", "Day": "$Day", "eventCode": "$EventCode"}, "count": {"$sum": 1}}}
    result = collection.aggregate([match, group])  # Group by monthyear (not day)

    # print(list(result))
    return list(result)


def getEventByCountryCodeByMonthByYear(args, db):
    """
    Get all events given a list of countries, a month and a year
    :param args: list of countries, month, year
    :param db: MongoDB test database
    :return:
    """
    # get gdelt collection
    # collection = db.gdelt_date
    collection = db.gdelt

    # get region and year
    list_countries = args[0]
    month_year = int(args[2] + args[1])

    query = {"Actor1Geo_CountryCode": {"$in": list_countries}, "MonthYear": month_year}
    result = collection.find(query)

    return list(result)


def getCountDifferentEventsByCountryCodeByMonthByYear(args, db):
    """
    Get count of different events given a list of countries, a month and a year
    :param args: list of countries, a month and a year
    :param db: MongoDB test database
    :return:
    """

    # get gdelt collection
    # collection = db.gdelt_date
    collection = db.gdelt

    # get region and year
    list_countries = args[0]
    month_year = int(args[2] + args[1])

    match = {"$match": {"Actor1Geo_CountryCode": {"$in": list_countries}, "MonthYear": month_year}}
    group = {"$group": {"_id": "$EventCode", "count": {"$sum": 1}}}
    result = collection.aggregate([match, group])

    return list(result)


def getCountDifferentEventsByCountryCodeByStartByEnd(args, db):
    """
    Get count of different events given a region, start date and an end date
    :param args: region, start date, end date
    :param db: MongoDB test database
    :return:
    """

    # get gdelt collection
    collection = db.gdelt

    # get region and year
    list_countries = args[0]

    # get dates
    start_date = int(args[1])

    end_date = int(args[2])

    print(start_date, end_date)

    match = {"$match": {"Actor1Geo_CountryCode": {"$in": list_countries},
                        "Day": {"$gte": start_date, "$lt": end_date}}}
    group = {"$group": {"_id": "$EventCode", "count": {"$sum": 1}}}
    result = collection.aggregate([match, group])

    return list(result)


def getAllHumanitarianEventsByRegionByYear(args, db):
    """
    Get all events given a region and a year
    :param args: region, year
    :param db: MongoDB test database
    :return:
    """
    # get gdelt collection
    # collection = db.gdelt_date
    collection = db.gdelt
    collection.create_index([("loc", GEOSPHERE)])

    # get region and year
    r = args[0]
    year = int(args[1])

    # get region collection
    region = db[r]
    region.create_index([("geometry", GEOSPHERE)])

    zone = region.find_one()

    match = {"$match": {"loc": {"$geoWithin": {"$geometry": zone["geometry"]}}, "Year": year}}
    group = {"$group": {"_id": "$loc", "count": {"$sum": 1}}}

    aggregate = collection.aggregate([match, group])

    return list(aggregate)


def getAllHumanitarianEventsByRegionByMonthByYear(args, db):
    """
    Get all events given a region, a month and a year
    :param args: region, month, year
    :param db: MongoDB test database
    :return:
    """
    # get gdelt collection
    # collection = db.gdelt_date
    collection = db.gdelt
    collection.create_index([("loc", GEOSPHERE)])

    # get region and year
    r = args[0]
    month_year = int(args[2] + args[1])

    # get region collection
    region = db[r]
    region.create_index([("geometry", GEOSPHERE)])

    zone = region.find_one()

    match = {"$match": {"loc": {"$geoWithin": {"$geometry": zone["geometry"]}}, "MonthYear": month_year}}
    group = {"$group": {"_id": "$loc", "count": {"$sum": 1}}}

    aggregate = collection.aggregate([match, group])

    return list(aggregate)


def getDifferentEventsByRegionByYear(args, db):
    """
    Get all distinct events given a region and a year
    :param args: region, year
    :param db: MongoDB test database
    :return:
    """
    # get gdelt collection
    # collection = db.gdelt_date
    collection = db.gdelt
    collection.create_index([("loc", GEOSPHERE)])

    # get region and year
    r = args[0]
    year = int(args[1])

    # get region collection
    region = db[r]
    region.create_index([("geometry", GEOSPHERE)])

    zone = region.find_one()

    match = {"$match": {"loc": {"$geoWithin": {"$geometry": zone["geometry"]}}, "Year": year}}
    group = {"$group": {"_id": {"loc": "$loc", "eventCode": "$EventCode"}, "count": {"$sum": 1}}}

    aggregate = collection.aggregate([match, group])

    return list(aggregate)


def getDifferentEventsByRegionByMonthByYear(args, db):
    """
    Get all distinct events given a region, a month and a year
    :param args: region, year
    :param db: MongoDB test database
    :return:
    """
    # get gdelt collection
    # collection = db.gdelt_date
    collection = db.gdelt
    collection.create_index([("loc", GEOSPHERE)])

    # get region and year
    r = args[0]

    month_year = int(args[2] + args[1])

    # get region collection
    region = db[r]
    region.create_index([("geometry", GEOSPHERE)])

    zone = region.find_one()

    match = {"$match": {"loc": {"$geoWithin": {"$geometry": zone["geometry"]}}, "MonthYear": month_year}}
    group = {"$group": {"_id": {"loc": "$loc", "eventCode": "$EventCode"}, "count": {"$sum": 1}}}

    aggregate = collection.aggregate([match, group])

    return list(aggregate)


if __name__ == '__main__':
    # create a MongoClient to the running mongod instance
    client = MongoClient('localhost', 27017)

    # getting a Database
    db = client.test

    # getting gdelt collection
    collection = db.gdelt
