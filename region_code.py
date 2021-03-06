import sys
import json


def preprocess_json(jsonfile, codefile):
    with open(jsonfile, 'r') as f:
        json_str = json.load(f)

    with open(codefile, 'r') as codes:
        codes_str = json.load(codes)

    codes_in_region = []

    for f in json_str["features"]:
        name_c = f["properties"]["name"]
        res = list(filter(lambda country: country["Name"] == name_c, codes_str))
        if not res:
            print(name_c)
        else:
            codes_in_region.append(res[0]["Code"])

    print(codes_in_region)

    # with open(output, "w") as fileOutput:
    #     json.dump(dict_json, fileOutput)


def country_iso(jsonfile, codefile):
    with open(jsonfile, 'r') as f:
        json_str = json.load(f)

    with open(codefile, 'r') as codes:
        codes_str = json.load(codes)

    iso = {}

    for f in json_str["features"]:
        name_c = f["properties"]["name"]
        res = list(filter(lambda country: country["Name"] == name_c, codes_str))
        if not res:
            print(name_c)
        else:
            iso[res[0]["Code"]] = res[0]["Name"]

    print(iso)

    # with open(output, "w") as fileOutput:
    #     json.dump(dict_json, fileOutput)



if __name__ == '__main__':
    # args : number of files
    args = sys.argv[1:]

    # region
    if len(args) == 1:
        region = args[0]
    else:
        region = "oceania"

    jsonfile = region + '.geojson'
    output = region + '_formatted.geojson'
    codefile = 'data_json.json'

    # preprocess_json(jsonfile, codefile)
    country_iso(jsonfile, codefile)
