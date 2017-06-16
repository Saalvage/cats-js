/*
*   The Cat API API wrapper
*/

//Requirements

const request = require("request"),
      xml2json = require("xml2json");


//Variables

/**
 * Cat object that is being used
 * @var {Cat} self
 */
var self;


//Constants

const TYPES = ["png", "jpg", "gif"],
      //"kittens" returns nothing when used
      CATEGORIES = ["hats", "space", "funny", "sunglasses", "boxes", "caturday", "ties", "dream","kittens", "sinks", "clothes"],
      SIZES = ["small", "med", "full"];


/**
 * API object
 * @constructor
 * @param {string} [aKey] - API key
 */
var Cat = function(aKey){
    if (aKey){
        this.key = aKey;
    }
    self = this;
}


//Main Functions

/**
 * Get random cat picture(s)
 * @function Cat.getCat
 * @return {Promise} Promise that contains the API call
 * @param {Object} [obj] - Object containing all properties for the API call
 * @param {string} [obj.image_id] - Unique ID of the image to return. Will only ever return one image
 * @param {string} [obj.type=jpg,gif,png] - Comma separated string of file types to return. (jpg|png|gif)
 * @param {number} [obj.results_per_page=1] - Amount of pictures to return (1 - 100)
 * @param {string} [obj.category] - Single category to filter for (see Cat.list for a list)
 * @param {string} [obj.size=full] - Image size (small = 250x|med = 500x|full = original size)
 * @param {string} [obj.sub_id] - Passing this will return the value of any Favourite or Votes set with the same sub_id for the image
 */
Cat.prototype.get = function(obj) {
    var obj = obj || {};
    var image_id = obj.image_id,
        type = (obj.type ? obj.type.replace(" ", "") : undefined),
        results_per_page = obj.results_per_page,
        category = obj.category,
        size = obj.size,
        sub_id = obj.sub_id;
    return new Promise(function(resolve, reject) {
        if (results_per_page < 1 || results_per_page > 100) {
            reject(new RangeError("results_per_page value (" + results_per_page + ") outside of acceptable range (1 - 100)"));
            return;
        }
        if (image_id && results_per_page && results_per_page > 1) {
            reject(new Error("image_id and results_per_page are set but results_per_page is greater than 1"));
            return;
        }
        if (type && isInvalidType(type.toLowerCase().split(","))) {
            reject(new Error("type: '" + type + "' is invalid"));
            return;
        }
        if (category && CATEGORIES.indexOf(category.toLowerCase()) == -1) {
            reject(new Error("category: '" + category + "' is invalid"));
            return;
        }
        if (size && SIZES.indexOf(size.toLowerCase()) == -1) {
            reject(new Error("size: '" + size + "' is invalid"));
            return;
        }
        request("http://thecatapi.com/api/images/get?format=xml"
                + (self.key ? "&api_key=" + self.key : "")
                + (image_id ? "&image_id=" + image_id : "")
                + (type ? "&type=" + type : "" )
                + (results_per_page ? "&results_per_page=" + results_per_page : "")
                + (category ? "&category=" + category : "")
                + (size ? "&size=" + size : ""),
            function(error, response, body) {
                respond(error, response, body, resolve, reject);
            }
        );
    });
}

/**
 * Vote on a picture
 * @function Cat.vote
 * @return {Promise} Promise that contains the API call
 * @param {Object} obj - Object containing all properties for the API call
 * @param {string} obj.image_id - Unique ID of the image to vote on
 * @param {number} obj.score - score you want to give to the image (1 (bad) - 10 (good))
 * @param {string} [obj.sub_id] - passing this will associate this vote with the provided sub_id
 */
Cat.prototype.vote = function(obj) {
    var obj = obj || {};
    var image_id = obj.image_id,
        score = obj.score,
        sub_id = obj.sub_id;
    return new Promise(function(resolve, reject) {
        if (!self.key) {
            reject(new Error("Can't use vote when no API key is provided"));
            return;
        }
        if (score > 10 || score < 1) {
            reject(new RangeError("score value (" + score + ") outside of acceptable range (1 - 10)"));
            return;
        }
        if (!(score && image_id)) {
            reject(new Error("Not all required values (image_id & score) were set"));
            return;
        }
        request("http://thecatapi.com/api/images/vote?api_key="+ self.key
                + "&image_id=" + image_id
                + "&score=" + score
                + (sub_id ? "&sub_id=" + sub_id : ""),
            function(error, response, body) {
                respond(error, response, body, resolve, reject);
            }
        );
    });
}

/**
 * Get the votes on a picture
 * @function Cat.getVotes
 * @return {Promise} Promise that contains the API call
 * @param {Object} [obj] - Object containing all properties for the API call
 * @param {string} [obj.sub_id] - sub_id to return the votes for
 */
Cat.prototype.getVotes = function(obj) {
    var obj = obj || {};
    var sub_id = obj.sub_id;
    return new Promise(function(resolve, reject) {
        if (!self.key) {
            reject(new Error("Can't use getVotes when no API key is provided"));
            return;
        }
        request("http://thecatapi.com/api/images/getvotes?api_key=" + self.key
            	+ (sub_id ? "&sub_id=" + sub_id : ""),
            function(error, response, body) {
                respond(error, response, body, resolve, reject);
            }
        );
    });
}

/**
 * Favourite/unfavourite a picture
 * @function Cat.favourite
 * @return {Promise} Promise that contains the API call
 * @param {Object} obj - Object containing all properties for the API call
 * @param {string} obj.image_id - Unique ID of the image to (un-)favourite 
 * @param {string} [obj.action=add] - Whether to favourite or unfavourite (add|remove)
 * @param {string} [obj.sub_id] - Passing this will associate the (un-)favourite to the provided sub_id
 */
Cat.prototype.favourite = function(obj) {
    var obj = obj || {};
    var image_id = obj.image_id,
        action = (obj.action ? obj.action.toLowerCase() : undefined),
        sub_id = obj.sub_id;
    return new Promise(function(resolve, reject) {
        if (!self.key) {
            reject(new Error("Can't use favourite when no API key is provided"));
            return;
        }
        if (action && action != "add" && action != "remove") {
            reject(new Error("action: '" + action + "' is invalid"));
            return;
        }
        if (!image_id) {
            reject(new Error("Not all required values (image_id) were set"));
            return;
        }
        request("http://thecatapi.com/api/images/favourite?api_key=" + self.key
                + "&image_id=" + image_id
                + (action ? "&action=" + action : "")
                + (sub_id ? "&sub_id=" + sub_id : ""),
            function(error, response, body) {
                respond(error, response, body, resolve, reject);
            }
        );
    });
}

/**
 * Get all favourites set with your API key
 * @function Cat.getFavourites
 * @return {Promise} Promise that contains the API call
 * @param {Object} [obj] - Object containing all properties for the API call
 * @param {string} [obj.sub_id] - Passing this will only return all favourites related to the provided sub_id 
 */
Cat.prototype.getFavourites = function(obj) {
    var obj = obj || {};
    var sub_id = obj.sub_id;
    return new Promise(function(resolve, reject) {
        if (!self.key) {
            reject(new Error("Can't use getFavourites when no API key is provided"));
            return;
        }
        request("http://thecatapi.com/api/images/getfavourites?api_key=" + self.key
                + (sub_id ? "&sub_id=" + sub_id : ""),
            function(error, response, body) {
                respond(error, response, body, resolve, reject);
            }
        );
    });
}

/**
 * Reports an image which stops it from showing up when using get with your API key
 * @function Cat.report
 * @return {Promise} Promise that contains the API call
 * @param {Object} obj - Object containing all properties for the API call
 * @param {string} obj.image_id - Unique ID of the image to report
 * @param {string} [obj.sub_id] - Passing this will associate the report to the specified sub_id
 * @param {string} [obj.reason] - Reason for the report
 */
Cat.prototype.report = function(obj) {
    var obj = obj || {};
    var image_id = obj.image_id,
        sub_id = obj.sub_id,
        reason = obj.reason;
    return new Promise(function (resolve, reject) {
        if (!self.key) {
            reject(new Error("Can't use report when no API key is provided"));
            return;
        }
        if (!image_id) {
            reject(new Error("Not all required values (image_id) were set"))
        }
        request("http://thecatapi.com/api/images/report?api_key=" + self.key
                + "&image_id=" + image_id
                + (sub_id ? "&sub_id=" + sub_id : "")
                + (reason ? "&reason=" + reason : ""),
            function(error, response, body) {
                respond(error, response, body, resolve, reject);
            }
        );
    });
}

/**
 * Gets a list of all valid categories,
 * currently: "hats", "space", "funny", "sunglasses", "boxes", "caturday", "ties", "dream","kittens", "sinks", "clothes"
 * @function Cat.list
 * @return {Promise} Promise that contains the API call
 */
Cat.prototype.list = function() {
    return new Promise(function (resolve, reject) {
        request("http://thecatapi.com/api/categories/list",
            function(error, response, body) {
                respond(error, response, body, resolve, reject);
            }
        );
    });
}

/**
 * Gets the number for all requests/votes/favourites for your API key
 * @function Cat.getOverview
 * @return {Promise} Promise that contains the API call
 */
Cat.prototype.getOverview = function() {
    if (!self.key) {
        reject(new Error("Can't use getOverview when no API key is provided"));
        return;
    }
    return new Promise(function (resolve, reject) {
        request("http://thecatapi.com/api/stats/getoverview?api_key=" + self.key,
            function(error, response, body) {
                respond(error, response, body, resolve, reject);
            }
        );
    });
}


//Help Functions

function isInvalidType(a) {
    if (a.length < 4) {
        var valid = 0;
        for (var i = 0; i < a.length; i++) {
            for (var j = 0; j < 4; j++) {
                if (a[i] == TYPES[j]) {
                    valid++;
                    break;
                }
            }
        }
        if (valid != a.length) {
            return true;
        } else {
            return false;
        }
    } else {
        return true;
    }
}

function respond(error, response, body, resolve, reject) {
    if (error) {
        reject(error);
    } else {
        body = xml2json.toJson(body, {"object": true}).response;
        if (body.apierror) {
            reject(new Error(body.apierror.message));
        } else {
            resolve(body.data);
        }
    }
}

module.exports = Cat;