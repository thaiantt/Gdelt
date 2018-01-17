from pymongo import MongoClient


if __name__ == '__main__':
    print("kikoo")
    client = MongoClient("mongodb://gdelt_user:telecom@54.234.228.247/test")

    # getting a Database
    db = client.test

    # query
    result = db.gdelt.count()
    print(result)
