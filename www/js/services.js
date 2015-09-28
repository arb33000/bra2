angular.module('ionicApp.services', [])
    .factory('GAEService', ['$http', '$q','$timeout',
        function($http) {

            var doRequest = function(data, path) {
                return $http({
                    method: 'JSONP',
                    url: "http://"+arb.serverUrl+"/" + path + "?data=" + data + "&callback=JSON_CALLBACK"
                });
            }
            var saveAlert = function(alert) {
				var data = new Array();
                data = "{\"alerts\":[" + JSON.stringify(alert) + "]}";
				console.log(data);
                var aesUtil = new AesUtil(arb.keySize, arb.iterationCount);
                console.log("aesUtil" +  aesUtil + arb.salt + arb.iv + dateUserInfo);
                var encryptdata = aesUtil.encrypt(arb.salt, arb.iv, dateUserInfo, data);
                console.log("encryptdata");
                var alldata = "{\"uuid\":\"" + alert.uuid + "\",\"encrypteddata\":\"" + encryptdata + "\"}";
                console.log("alldata");
                var alldataencodeuri = encodeURIComponent(alldata);
                console.log("alldataencodeuri");

				var url = "http://"+arb.serverUrl+"/setalert?data=" + alldataencodeuri + "&callback=JSON_CALLBACK";
				
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

                var aesUtil = new AesUtil(arb.keySize, arb.iterationCount);
                var encryptdata = aesUtil.encrypt(arb.salt, arb.iv, dateUserInfo, arrData);
                var alldata = "{\"uuid\":\"" + alert.uuid + "\",\"encrypteddata\":\"" + encryptdata + "\"}";
                var alldataencodeuri = encodeURIComponent(alldata);

                return $http({
                    method: 'JSONP',
                    url: "http://"+arb.serverUrl+"/removealert?data=" + alldataencodeuri + "&callback=JSON_CALLBACK"
                });
            }
            var setUserInfo = function(platform, uuid, pushToken) {
				var url = "http://"+arb.serverUrl+"/setuserinfo?data={\"uuid\":" + platform + uuid + ",\"platform\":\"" + platform + "\",\"token_push\":\"" + pushToken + "\",\"date\":\"" + dateUserInfo + "\"}&callback=JSON_CALLBACK";			
                //alert('setUserInfo' + url);
                return $http({
                    method: 'JSONP',
                    url: url
                });
            }
			var checkAlert = function(platform, uuid,localStorageService) {
				var alertList = localStorageService.get('alertList');
	
				var url = "";
				if(alertList == null) {
					url = "http://"+arb.serverUrl+"/checkalert?data={\"uuid\":\"" + platform + uuid + "\",\"platform\":\"" + platform + "\"}&callback=JSON_CALLBACK";
				} else {
					var data = new Array();
					data = "{\"alerts\":[" + JSON.stringify(alertList) + "]}";
					
					var aesUtil = new AesUtil(arb.keySize, arb.iterationCount);
					var encryptdata = aesUtil.encrypt(arb.salt, arb.iv, dateUserInfo, data);
					//var alldata = "{\"encrypteddata\":\"" + encryptdata + "\"}";
					var alldataencodeuri = encodeURIComponent(encryptdata);
					url = "http://"+arb.serverUrl+"/checkalert?data={\"uuid\":\"" + platform + uuid + "\",\"platform\":\"" + platform + "\",\"alertlist\":\"" + alldataencodeuri+ "\"}&callback=JSON_CALLBACK";
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
