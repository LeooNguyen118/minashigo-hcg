const CryptoJS = require("crypto-js");
const fs = require("fs");
const axios = require("axios");
const https = require("https");
const o = require('url');

/// Replace this object by getVersion's response
const __ = {
  "resourceVersion": "2.2.31",
  "masterVersion": "2.1.69",
  "clientVersion": "2.2.3"
}

/// Replace this object by getDmmAccessToken's response
const _ = {
  "dmmId": "",
  "userId": "",
  "token": "",
  "secret": "",
  "expires": 0
}

const _data = {
  "dmmId": _.dmmId,
  "user_id": _.userId,
  "game_server_token": _.token,
  "game_server_secret": _.secret,
  "consumer_key": "jFxXF3M0n4P056yfXtogRRjkZpWFTm52",
  "consumer_secret": "Ti60QlOqMur6trRkQY64xJkpRm47BupdPVM7bw5udWBxXPEQKGDraAmeO0y062DT2oVbSkbYbV0vWlSUe7y5OpVEwnqiMbyWHhqQA6ycS6utzRiCtHos9YDDjJ94JXuaBK7u0SGAjo1HK4pv4w5yegGBo3t1LyGICWAQ6XWxq82O",
  "signature_method": "HMAC-SHA256"
};

(async function main() {
  const { result, version } = await getResource()
  if (result) {
    const stand_resource = JSON.parse(result)

    const standImages = Object.keys(stand_resource.assets).filter((asset) =>
      asset.includes(`image/character/stand`) && asset.includes(`3.png`)
    );

    const ids = standImages.map((image) => {
      return image.split("/").at(-1).replace('03.png', '') ;
    });

    //#region stand image urls
    // const standImageMap = standImages.map((image) => {
    //   const name = image.split("/").at(-1);
    //   const url = _getUrl(image, _getMd5(stand_resource, image)).split('/')
    //   url.splice(3, 1, version)
    //   return { name, url: url.join('/') };
    // });
    // fs.writeFile(
    //   "standImages.json",
    //   JSON.stringify({ data: standImageMap }, null, 4),
    //   "utf8",
    //   () => console.log("done")
    // );
    //#endregion

    const httpsAgent = new https.Agent({
      rejectUnauthorized: false, // (NOTE: this will disable client verification)
      cert: fs.readFileSync("./cert.pem"),
      key: fs.readFileSync("./key.pem"),
      passphrase: "",
    });

    const resource = []
    for (const id of ids.filter(id => (id + '').length === 6)) {
      for (let i = 0; (ids.some(x => (x + '') === ((id + '') + '99')) ? i < 4 : i < 3); i++) {
        for (let j = 1; j < 12; j++) {
          try {
            const { data } = await axios.post("https://minasigo-no-shigoto-web-r-server.orphans-order.com/mnsg/story/getStoryResource", {
              "data": encrypt(`{"path":"adv/image/character/${id}/image/${i}0${j}.jpg","quality":3}`, _.token)
            }, {
              httpsAgent,
              "headers": {
                "accept": "application/json;charset=UTF-8",
                "authorization": getAuthorization('POST', 'https://minasigo-no-shigoto-web-r-server.orphans-order.com/mnsg/story/getStoryResource'),
                "content-type": "application/json;charset=UTF-8",
                "x-mnsg-app-version": JSON.stringify(__)
              }
            })
            const { resources: [{ path, md5 }] } = JSON.parse(decrypt(data, _.token))
            const adding = {
              name: id + '_' + path.split('/').at(-1),
              url: _getUrl(path, md5)
            }
            resource.push(adding)
            console.log('adding', adding)
          } catch {
            console.log('ERROR', { id, i, j })
            break;
          }

        }
      }
    }
    fs.writeFileSync('./cg.json', JSON.stringify({ data: resource }))

  } else {
    console.log('result returns null')
  }
})()


/////////////////////////////////////////////////////////////////////////
async function getResource() {
  const versionResponse = await axios.get(`https://minasigo-no-shigoto-web-r-server.orphans-order.com/mnsg/user/getVersion`)

  if (versionResponse.data && versionResponse.data.version?.resourceVersion) {
    const resourceResponse = await axios.get(`https://minasigo-no-shigoto-pd-c-res.orphans-order.com/${versionResponse.data.version.resourceVersion}/resource.json`)
    fs.writeFile(
      "result.json",
      _decrypt(resourceResponse.data),
      "utf8",
      () => console.log("done getResource()")
    );
    return { result: _decrypt(resourceResponse.data), version: versionResponse.data.version.resourceVersion }
  }
  return null
}

function _decrypt(t) {
  var e = CryptoJS.SHA256("#mnsg#manifest"),
    i = CryptoJS.enc.Base64.stringify(e).substr(0, 32),
    n = { iv: "BFA4332ECFDCB3D1DA2633B5AB509094", mode: CryptoJS.mode.CTR },
    o = CryptoJS.AES.decrypt(t, i, n);

  const result = CryptoJS.enc.Utf8.stringify(o);

  return result;
}

function _getUrl(ciphertext, md5, version = __.resourceVersion) {
  var d = function (t) {
    return [t.substring(0, 2), t.substring(4, 6)];
  };
  var h = function (t) {
    return [t.substring(2, 4), t.substring(6, 8), t.substring(0, 2)];
  };
  var p = function (t) {
    return [
      t.substring(4, 6),
      t.substring(0, 2),
      t.substring(6, 8),
      t.substring(2, 4),
    ];
  };
  var _ = function (t) {
    return [
      t.substring(6, 8),
      t.substring(2, 4),
      t.substring(4, 6),
      t.substring(0, 2),
    ];
  };
  var f = {
    0: d,
    1: d,
    2: d,
    3: d,
    4: h,
    5: h,
    6: h,
    7: h,
    8: p,
    9: p,
    a: p,
    b: p,
    c: _,
    d: _,
    e: _,
    f: _,
  };

  // function convertMD5Path(t) {
  //   if (!t) return "";
  //   var e = CryptoJS.MD5(t.path).toString(CryptoJS.enc.Hex),
  //     i = t.path.substr(0, t.path.lastIndexOf(".")),
  //     s = g(CryptoJS.MD5(i).toString(CryptoJS.enc.Hex)),
  //     a = cc.path.extname(t.path);
  //   return cc.path.join(e, s, t.md5 + a);
  // }

  var e = CryptoJS.MD5(ciphertext).toString(CryptoJS.enc.Hex);
  var i = ciphertext.substr(0, ciphertext.lastIndexOf("."));
  var a = g(CryptoJS.MD5(i).toString(CryptoJS.enc.Hex));
  var n = md5 + "." + (ciphertext.split(".")[1] || "png");

  function g(t) {
    if ("." === t[0]) return "";
    var e = t[0];
    return f[e](t).join("/");
  }

  return `https://minasigo-no-shigoto-pd-c-res.orphans-order.com/${version}/${e}/${a}/${n}`;
}

function _getMd5(resource, image) {
  return resource.assets[image]["0"]?.md5 || resource.assets[image]["3"].md5;
}

function _normalizeUrl(t) {
  var e = o.parse(t, !0);
  return delete e.query,
    delete e.search,
    o.format(e)
}

function _normalizeParameters(t) {
  var e = [];
  return Object.keys(t).sort().forEach(function (i) {
    e.push(i + "=" + t[i])
  }),
    e.join("&")
}

function _constructBaseString(t, e, i) {
  return [t.toUpperCase(), _encode(e), _encode(i)].join("&")
}

function _encode(t) {
  return encodeURIComponent(t).replace("(", "%28").replace(")", "%29").replace("$", "%24").replace("!", "%21").replace("*", "%2A").replace("'", "%27").replace("%7E", "~")
}

function decrypt(t, e) {
  var i = CryptoJS.SHA256(e + "one-deep")
    , n = i.toString(CryptoJS.enc.Base64).substr(0, 32)
    , o = {
      iv: (i = CryptoJS.SHA256(e.substr(0, 16))).toString(CryptoJS.enc.Base64).substr(0, 16),
      mode: CryptoJS.mode.CTR
    };
  return CryptoJS.AES.decrypt(t, n, o).toString(CryptoJS.enc.Utf8)
}
function encrypt(t, e) {
  var i = CryptoJS.SHA256(e + "one-deep")
    , n = i.toString(CryptoJS.enc.Base64).substr(0, 32)
    , o = {
      iv: (i = CryptoJS.SHA256(e.substr(0, 16))).toString(CryptoJS.enc.Base64).substr(0, 16),
      mode: CryptoJS.mode.CTR
    };
  return CryptoJS.AES.encrypt(t, n, o).toString()
}

function encryptHmac(t, e) {
  return CryptoJS.HmacSHA256(t, e).toString(CryptoJS.enc.Base64)
}

function getAuthorization(t, e) {
  var i = {}
    , o = "";
  e.lastIndexOf("RequestToken") >= 0 ? o += 'OAuth realm="Clients"' : e.lastIndexOf("AccessToken") >= 0 ? (o += 'OAuth realm="Clients"',
    i.oauth_token = _data.game_server_token) : (o += 'OAuth realm="Users"',
      i.oauth_token = _data.game_server_token),
    i.xoauth_requestor_id = _data.user_id,
    i.oauth_consumer_key = _data.consumer_key,
    i.oauth_signature_method = _data.signature_method,
    i.oauth_nonce = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
    i.oauth_timestamp = Math.floor(Date.now() / 1e3);
  var s = _normalizeUrl(e)
    , a = _normalizeParameters(i)
    , r = _constructBaseString(t, s, a)
    , u = _encode(_data.consumer_secret) + "&";

  return _data.game_server_secret && (u += _data.game_server_secret),
    i.oauth_signature = encryptHmac(r, u),
    Object.keys(i).forEach(function (t) {
      o = o + " " + t + '="' + i[t] + '"'
    }),
    o
}