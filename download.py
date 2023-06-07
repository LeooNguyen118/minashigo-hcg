import json
import requests
from os import listdir
from pathlib import Path


file = open("cg.json", encoding='utf-8')
jsonData = json.load(file)


for row in jsonData["data"]:
    folder = listdir("./cg/")
    if(row["name"] not in folder):
        print('Downloading {}'.format(row))
        url = row["url"]
        r = requests.get(url, allow_redirects=True)
        output_file = Path("./cg/{}".format(row["name"]))
        output_file.write_bytes(r.content)


file.close()
