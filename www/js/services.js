angular.module('ionicApp.services', [])
    .factory('GAEService', ['$http', '$q','$timeout',
        function($http) {

            var doRequest = function(data, path) {
                return $http({
                    method: 'JSONP',
                    url: "http://"+serverUrl+"/" + path + "?data=" + data + "&callback=JSON_CALLBACK"
                });
            }
            var saveAlert = function(alert) {
				var data = new Array();
                data = "{\"alerts\":[" + JSON.stringify(alert) + "]}";
				
                var aesUtil = new AesUtil(keySize, iterationCount);
                var encryptdata = aesUtil.encrypt(salt, iv, dateUserInfo, data);
                var alldata = "{\"uuid\":\"" + alert.uuid + "\",\"encrypteddata\":\"" + encryptdata + "\"}";
                var alldataencodeuri = encodeURIComponent(alldata);

				var url = "http://"+serverUrl+"/setalert?data=" + alldataencodeuri + "&callback=JSON_CALLBACK";
				
                return $http({
                    method: 'JSONP',
                    url: url
                });
            }
            var deleteAlert = function(alert) {
                var data = {};
                data.alerts = {};

                data.alerts.uuid = alert.uuid;
                data.alerts.id = alert.id;

                var arrData = new Array();
                arrData = "{\"alerts\":[" + JSON.stringify(data.alerts) + "]}";

                var aesUtil = new AesUtil(keySize, iterationCount);
                var encryptdata = aesUtil.encrypt(salt, iv, dateUserInfo, arrData);
                var alldata = "{\"uuid\":\"" + alert.uuid + "\",\"encrypteddata\":\"" + encryptdata + "\"}";
                var alldataencodeuri = encodeURIComponent(alldata);

                return $http({
                    method: 'JSONP',
                    url: "http://"+serverUrl+"/removealert?data=" + alldataencodeuri + "&callback=JSON_CALLBACK"
                });
            }
            var setUserInfo = function(platform, uuid, pushToken) {
				var url = "http://"+serverUrl+"/setuserinfo?data={\"uuid\":" + platform + uuid + ",\"platform\":\"" + platform + "\",\"token_push\":\"" + pushToken + "\",\"date\":\"" + dateUserInfo + "\"}&callback=JSON_CALLBACK";			

                return $http({
                    method: 'JSONP',
                    url: url
                });
            }
			var checkAlert = function(platform, uuid,localStorageService) {
				var alertList = localStorageService.get('alertList');
	
				var url = "";
				if(alertList == null) {
					url = "http://"+serverUrl+"/checkalert?data={\"uuid\":\"" + platform + uuid + "\",\"platform\":\"" + platform + "\"}&callback=JSON_CALLBACK";
				} else {
					var data = new Array();
					data = "{\"alerts\":[" + JSON.stringify(alertList) + "]}";
					
					var aesUtil = new AesUtil(keySize, iterationCount);
					var encryptdata = aesUtil.encrypt(salt, iv, dateUserInfo, data);
					//var alldata = "{\"encrypteddata\":\"" + encryptdata + "\"}";
					var alldataencodeuri = encodeURIComponent(encryptdata);
					url = "http://"+serverUrl+"/checkalert?data={\"uuid\":\"" + platform + uuid + "\",\"platform\":\"" + platform + "\",\"alertlist\":\"" + alldataencodeuri+ "\"}&callback=JSON_CALLBACK";
				}

                return $http({
                    method: 'JSONP',
                    url: url
                });
			}
            return {
                getInfo: function(data) {
                    return doRequest(data, 'getinforocade');
                },
                saveAlert: function(alert) {
                    return saveAlert(alert);
                },
                deleteAlert: function(alert) {
                    return deleteAlert(alert);
                },
                setUserInfo: function(platform, uuid, pushToken) {
                    return setUserInfo(platform, uuid, pushToken);
                },
				checkAlert: function(platform, uuid,localStorageService) {
					return checkAlert(platform, uuid,localStorageService);
				},
            };
        }
    ]);
