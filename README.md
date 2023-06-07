This tool uses NodeJS for fetching data and Python for downloading assets

- `npm i` to install NodeJS dependencies
- `pip install -r requirements.txt` to install Python dependencies (skip if you already have `requests` package)

- To get the CG manifests, run `npm start`
- After have all the CG manifests, run `python download.py`

----- ----- ----- ----- ----- ----- ----- ----- 

!!! IMPORTANT !!!
Manually modify constant values

----- ----- ----- ----- ----- ----- ----- ----- 

1. Open Minashigo on browser with DevTool opened.
2. Go to Network tab (For ease, filter by "get" and Fetch/XHR)
3. Find these xhr requests and copy those response to modify: 

In /index.js

```
const __ = {
  "resourceVersion": "2.2.31",
  "masterVersion": "2.1.69",
  "clientVersion": "2.2.3"
} /// Replace this object by getVersion's response

const _ = {
  "dmmId": "",
  "userId": "",
  "token": "",
  "secret": "",
  "expires": 0
} /// Replace this object by getDmmAccessToken's response
```
