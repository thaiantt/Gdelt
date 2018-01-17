import json
import time


def add_date(jsonfile, outputfile):
    """
    Change date in input json file
    :param jsonfile: the json file to modify
    :return: the new json file with date format at the Day field
    """
    print("Add Date")
    start_time = time.time()

    with open(jsonfile, 'r') as f:
        json_str = json.load(f)

    for i in range(len(json_str)):
        day = str(json_str[i]["Day"])
        day_str = day[:4] + "-" + day[4:6] + "-" + day[6:8]

        json_str[i]["Day"] = day_str

    with open(outputfile, "w") as jsonFile:
        json.dump(json_str, jsonFile)

    elapsed_time = time.time() - start_time
    print("     | Elapsed time : ", elapsed_time)
