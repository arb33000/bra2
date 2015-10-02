angular.module('ionicApp', ['ionic', 'ngIOS9UIWebViewPatch', 'LocalStorageModule', 'ionicApp.services'])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(0);
    $ionicConfigProvider.tabs.style("striped");
    $ionicConfigProvider.tabs.position("top");
    $stateProvider
        .state('tabs', {
            url: "/tab",
            abstract: true,
            templateUrl: "templates/tabs.html",
            controller: "TabsCtrl"
        })
        .state('tabs.home', {
            url: "/home",
            cache: false,
            views: {
                'home-tab': {
                    templateUrl: "home.html",
                    controller: "HomeCtrl"
                }
            }
        })
        .state('tabs.map', {
            url: "/map",
            cache: false,
            views: {
                'map-tab': {
                    templateUrl: "map.html",
                    controller: "MapCtrl"
                }
            }
        })
        .state('tabs.enter', {
            url: "/enter",
            cache: false,
            views: {
                'enter-tab': {
                    templateUrl: "pageListExit.html",
                    controller: "PageExitCtrl"
                }
            }
        })
        .state('tabs.alert', {
            url: "/enterAlert",
            cache: false,
            views: {
                'alert-tab': {
                    templateUrl: "pageListExit.html",
                    controller: "PageExitCtrl"
                }
            }
        })
        .state('tabs.pageTraficLive', {
            url: "/board",
            cache: false,
            views: {
                'enter-tab': {
                    templateUrl: 'pageTraficLive.html',
                    controller: "pageTraficLiveCtrl"
                }
            }
        })
        .state('tabs.pageNewAlert', {
            url: '/newalert',
            cache: false,
            views: {
                'alert-tab': {
                    templateUrl: 'newalert.html',
                    controller: "newAlertCtrl"
                }
            }
        })
        .state('loading', {
            url: '/5',
            templateUrl: 'pageLoading.html'
        })
    $urlRouterProvider.otherwise("/5");
})

.filter('object2Array', function() {
    return function(input) {
        var out = [];
        for (i in input) {
            out.push(input[i]);
        }
        return out;
    }
})

.controller('TabsCtrl', function($scope, $state, $location) {

window.HandleDeviceReady(settingsLoad);

function settingsLoad() {
}

    $scope.setAction = function(actionToSet) {
        //reset des entrées/sorties pour l'alerte courante
        arb.action = actionToSet;
        if (arb.action == "getLiveTrafic") {
            if ($location.$$path == '/tab/enter') {
                $state.reload();
            } else {
                $state.go('tabs.enter');
            }
        } else if (arb.action == "createAlert") {
            $state.go('tabs.alert');
        }
    }
})

.controller('MapCtrl', function($scope) {
    trackPage("Map");
})

.controller('HomeCtrl', function($scope, $ionicModal, GAEService, localStorageService, $state) {
    /*var part = document.URL.split("#");
    if (part[1] != null && part[1] != "") {
        GAEService.getInfo(part[1]).
        success(function(data) {
            dataFromNotif = data;
            $state.go('tabs.pageTraficLive');
        }).
        error(function(data) {});
    }*/

    //Init à 0 dans le cas ou on revient à la home apres une recherche
    //currentAlert.rocade.enter = 0;
    //currentAlert.rocade.exit = 0;
    trackPage("HomePage");

    $scope.lastAlertList = localStorageService.get('lastAlertList');;
    currentAlert.id = null;
    $scope.data = {};
    $scope.data.showDelete = false;

    $scope.showAide = lastAlertList === null && alertList === null;

    var pushNotification = window.plugins.pushNotification;

    if (ionicPlatform.isWindowsPhone()) {
        pushNotification.register(
            channelHandler,
            errorHandler, {
                "channelName": "alerterocadebordeaux",
                "ecb": "onNotificationWP8",
                "uccb": "channelHandler",
                "errcb": "jsonErrorHandler"
            });
    } else if (ionicPlatform.isAndroid()) {
        pushNotification.register(
            successHandler,
            errorHandler, {
                "senderID": "185801549405",
                "ecb": "onNotification"
            });
    } else if (ionicPlatform.isIOS()) {
        pushNotification.register(
            tokenHandler,
            errorHandler, {
                "badge": "true",
                "sound": "true",
                "alert": "true",
                "ecb": "onNotificationAPN"
            });
    }

    function channelHandler(event) {
        var uri = event.uri;
        if (uri === null || uri === "") {
            return;
        }

        dateUserInfo = localStorageService.get('dateLocalStorage');
        navigator.globalization.dateToString(
            new Date(),
            function(date) {
                dateUserInfo = date.value;
                GAEService.setUserInfo("wp", device.uuid, uri).
                success(function(data) {
                    if (data.result == 'ok') {
                        GAEService.checkAlert("wp", device.uuid, localStorageService).success(function(data) {
                            localStorageService.set('dateLocalStorage', dateUserInfo);
                        });
                    } else {
                        console.log('ERROR ' + data);
                    }
                }).
                error(function(data) {
                    console.log('ERROR ' + data);
                });
            },
            function() {}, {
                formatLength: 'short',
                selector: 'date and time'
            }
        );
    }

    jsonErrorHandler = function(error) {
        alert("error");
    }

    //handle MPNS notifications for WP8
    onNotificationWP8 = function(e) {
        // On ne fait rien...
    }

    // Android and Amazon Fire OS
    onNotification = function(e) {
        switch (e.event) {
            case 'registered':
                {
                    if (e.regid.length > 0) {
                        dateUserInfo = localStorageService.get('dateLocalStorage');
                        if (dateUserInfo === null) {
                            navigator.globalization.dateToString(
                                new Date(),
                                function(date) {
                                    dateUserInfo = date.value;
                                    GAEService.setUserInfo("android", device.uuid, e.regid).
                                    success(function(data) {
                                        if (data.result == 'ok') {
                                            GAEService.checkAlert("android", device.uuid, localStorageService).success(function(data) {
                                                localStorageService.set('dateLocalStorage', dateUserInfo);
                                            });
                                        } else {
                                            alert("Erreur, merci de réessayer plus tard." + JSON.stringify(data));
                                            console.log('ERROR ' + data);
                                        }
                                    }).
                                    error(function(data) {
                                        alert("Erreur, merci de réessayer plus tard." + JSON.stringify(data));
                                        console.log('ERROR ' + data);
                                    });
                                },
                                function() {
                                    alert('Error getting dateString\n');
                                }, {
                                    formatLength: 'short',
                                    selector: 'date and time'
                                }
                            );
                        }
                    }
                    break;
                }
            case 'message':
                {
                    dataFromNotif = e.payload.datainfo;
                    saveInHistoric = false;
                    $state.go('tabs.pageTraficLive', {}, {
                        reload: true
                    });
                    if (e.foreground) {
                        var soundfile = e.soundname || e.payload.sound;
                        var my_media = new Media("/android_asset/www/" + soundfile);
                        my_media.play();
                    } else {
                        if (e.coldstart) {} else {}
                    }

                    break;
                }
            case 'error':
                {
                    break;
                }
            default:
                {
                    break;
                }
        }
    }

    onNotificationAPN = function(event) {
        dataFromNotif = JSON.parse(event.data);
        saveInHistoric = false;
        $state.go('tabs.pageTraficLive', {}, {
            reload: true
        });
        if (event.alert) {
            navigator.notification.alert(event.alert);
        }
        if (event.sound) {
            var snd = new Media(event.sound);
            snd.play();
        }
        if (event.badge) {
            pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
        }
    }

    function successHandler(result) {}

    function errorHandler(error) {
        alert('error = ' + error);
    }

    function tokenHandler(result) {
        dateUserInfo = localStorageService.get('dateLocalStorage');
        if (dateUserInfo === null) {
            navigator.globalization.dateToString(
                new Date(),
                function(date) {
                    dateUserInfo = date.value;

                    GAEService.setUserInfo("ios", device.uuid, result).
                    success(function(data) {
                        if (data.result == 'ok') {
                            GAEService.checkAlert("ios", device.uuid, localStorageService).success(function(data) {
                                localStorageService.set('dateLocalStorage', dateUserInfo);
                            });
                        } else {
                            alert("Erreur, merci de réessayer plus tard");
                            console.log('ERROR ' + data);
                        }
                    }).
                    error(function(data) {
                        alert("Erreur, merci de réessayer plus tard!");
                        console.log('ERROR ' + data);
                    });
                },
                function() {
                    alert('Error getting dateString\n');
                }, {
                    formatLength: 'short',
                    selector: 'date and time'
                }
            );
        }
    }

    $scope.setAlert = function(myalert) {
        console.log('setAlert : '+myalert);
        currentAlert = myalert;
        //Si l'alarme est sync alors on va vers sa modification
        if (myalert.sync) {
            $state.go('tabs.pageNewAlert');
        }
        // Sinon on retente le sync
        else {
            trackPage("TryReSync");
            GAEService.saveAlert(myalert).
            success(function(data) {
                if (data.result == 'ok') {
                    alertList[data.alertIdList[0]].sync = true;
                    localStorageService.set('alertList', alertList);
                } else {
                    alert("Erreur, merci de réessayer plus tard.");
                    console.log('ERROR ' + data);
                }
            }).
            error(function(data) {
                alert("Erreur, merci de réessayer plus tard.");
                console.log('ERROR ' + data);
            });
        }
    }

    /*Appellé lors du clic sur une des dernières recherches*/
    $scope.goResult = function(alert) {
        currentAlert = alert;
        saveInHistoric = false;
        $state.go('tabs.pageTraficLive');
    }

    $scope.getSyncClass = function(alert) {
        if (alert.sync) {
            return "item item-balanced p16i";
        }
        return "item item-stable p16i";
    }

    $scope.deleteAlert = function(myalert) {
        trackPage("DeleteAlert");
        delete alertList[myalert.id];
        $scope.alertList = alertList;
        $scope.refreshAlertBar();
        //APPEL WS
        GAEService.deleteAlert(myalert).
        success(function(data) {
            if (data.result == 'ok') {
                localStorageService.set('alertList', alertList);
            } else {
                alertList[myalert.id] = myalert;
                alert('Erreur, merci de réessayer plus tard.');
                console.log('ERROR ' + data);
            }
        }).
        error(function(data) {
            alertList[myalert.id] = myalert;
            alert("Erreur, merci de réessayer plus tard.");
            console.log('ERROR ' + data);
        });
    }

    $scope.refreshAlertBar = function() {
        //Gestion affichage sous menu "mes alertes"
        if (Object.keys($scope.alertList).length == 0) {
            $scope.showAlertBar = false;
            $scope.data.showDelete = false;
        }
    }

    $scope.getTextFormDays = function(days, activate) {
        var retour = "";
        if (!activate.checked) {
            return "Désactivée";
        }
        if (days[0].checked && days[1].checked && days[2].checked && days[3].checked && days[4].checked && days[5].checked && days[6].checked) {
            return "Tous les jours";
        }
        if (days[0].checked && days[1].checked && days[2].checked && days[3].checked && days[4].checked && !days[5].checked && !days[6].checked) {
            return "Jours en semaine";
        }
        if (!days[0].checked && !days[1].checked && !days[2].checked && !days[3].checked && !days[4].checked && days[5].checked && days[6].checked) {
            return "Week-end";
        }
        if (days[0].checked) {
            retour += "Lun ";
        }
        if (days[1].checked) {
            retour += "Mar ";
        }
        if (days[2].checked) {
            retour += "Mer ";
        }
        if (days[3].checked) {
            retour += "Jeu ";
        }
        if (days[4].checked) {
            retour += "Ven ";
        }
        if (days[5].checked) {
            retour += "Sam ";
        }
        if (days[6].checked) {
            retour += "Dim ";
        }
        return retour;
    }

    alertList = localStorageService.get('alertList');
    $scope.alertList = alertList;
    $scope.showAlertBar = false;

    if ($scope.alertList != null && Object.keys($scope.alertList).length > 0) {
        $scope.showAlertBar = true;
    }

    $ionicModal.fromTemplateUrl('modalAideGeneral.html', function(modal) {
        $scope.modal = modal;
        if (localStorageService.get('hideHelp') != "true") {
            $scope.modal.show();
        }
    }, {
        animation: 'slide-in-up',
        focusFirstInput: true,
        scope: $scope
    });

    $ionicModal.fromTemplateUrl('modalInfo.html', function(modal) {
        $scope.modalInfo = modal;
    }, {
        animation: 'slide-in-up',
        focusFirstInput: true,
        scope: $scope
    });

})

.controller('modalAideGeneralCtrl', function($scope, localStorageService) {
    $scope.helpDisplay = {
        checked: true
    };
    $scope.exitSaveChoice = function() {
        trackPage("AideGeneral");
        localStorageService.set('hideHelp', $scope.helpDisplay.checked);
        $scope.modal.hide();
    }
})


.controller('newAlertCtrl', ['$scope', '$ionicScrollDelegate', '$ionicModal', 'localStorageService', 'GAEService', '$state',
    function($scope, $ionicScrollDelegate, $ionicModal, localStorageService, GAEService, $state) {
        var alertid = localStorageService.get('alertid');
        var creationMode = true;
        $scope.advancedView = false;

        $ionicModal.fromTemplateUrl('modalAideGeneral.html', function(modal) {
            $scope.modal = modal;
        }, {
            animation: 'slide-in-up',
            focusFirstInput: true,
            scope: $scope
        });

        // si pas de alertId, on est dans le cas d'une première alarme
        if (alertid === null) {
            alertid = 0;
            //Si currentAlert est null alors on est dans le cas d'une création d'alarme
        }
        if (currentAlert.id === null) {
            trackPage("NewAlert");
            $scope.title = "Création alerte";
            alertid++;

            if (platform == "PC") {
                window.device = {};
                window.device.uuid = "Local";
            }

            $scope.alert = {
                "id": alertid,
                "uuid": platform + window.device.uuid,
                "sync": false,
                "rangeInf": 70,
                "rangeSup": 70,
                "isAdvancedInf": {
                    checked: false
                },
                "isAdvancedSup": {
                    checked: false
                },
                "activate": {
                    checked: true
                },
                "rocade": currentAlert.rocade,
                "hour": "12h00",
                "days": [{
                    text: "Lundi",
                    checked: true
                }, {
                    text: "Mardi",
                    checked: true
                }, {
                    text: "Mercredi",
                    checked: true
                }, {
                    text: "Jeudi",
                    checked: true
                }, {
                    text: "Vendredi",
                    checked: true
                }, {
                    text: "Samedi",
                    checked: false
                }, {
                    text: "Dimanche",
                    checked: false
                }]
            };
        }
        //Modification d'alerte existante
        else {
            creationMode = false;
            trackPage("EditAlert");
            $scope.title = "Modification alerte";
            //Gestion de l'affichage du mode avancé
            if (currentAlert.isAdvancedSup.checked || currentAlert.isAdvancedInf.checked) {
                $scope.advancedView = true;
            }
            $scope.alert = currentAlert;
        }

        $scope.pluginHour = function() {
            var inputDate = new Date();
            //2 param : heures et minutes
            inputDate.setHours($scope.alert.hour.slice(0,$scope.alert.hour.indexOf('h')));
            inputDate.setMinutes($scope.alert.hour.slice(-2));
            options = {
                date: inputDate,
                mode: 'time',
                x: 100,
                y: 246,
                doneButtonLabel: 'Valider',
                cancelButtonLabel: 'Annuler',
                clearButton: false
            };
            datePicker.show(options, function(date) {
                if (!isNaN(date.getHours())) {
                    $scope.alert.hour = (date.getHours() < 10 ? '0' : '') + date.getHours() + "h" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
                    $scope.$apply();
                }
            });
        }

        $scope.goSelectExit = function(isEnter) {
            arb.action = "setExitAlert";
            if (isEnter) {
                arb.action = "setEnterAlert";
            }
            $state.go('tabs.alert');
        }

        $scope.toogleAdvancedView = function() {
            $scope.advancedView = !$scope.advancedView;
            $ionicScrollDelegate.resize();
        }

        $scope.setToogleOff = function(id) {
            if (id == 0 && $scope.alert.isAdvancedInf.checked) {
                $scope.alert.isAdvancedSup.checked = false;
            } else if (id == 1 && $scope.alert.isAdvancedSup.checked) {
                $scope.alert.isAdvancedInf.checked = false;
            }
        }

        $scope.saveAlert = function(myalert) {
            trackPage("SaveAlert");
            if (alertList === null) {
                alertList = {};
            }
            //On force la désynchro
            myalert.sync = false;
            /*if (platform == "PC") {
                myalert.sync = true;
            }*/

            alertList[myalert.id] = myalert;
            localStorageService.set('alertList', alertList);
            //on sette l'alertId Max seulement en cas de création
            if (creationMode) {
                localStorageService.set('alertid', myalert.id);
            }
            GAEService.saveAlert(myalert).
            success(function(data) {
                if (data.result == 'ok') {
                    alertList[data.alertIdList[0]].sync = true;
                    localStorageService.set('alertList', alertList);
                } else {
                    alert("Erreur, merci de réessayer plus tard.");
                    console.log('ERROR ' + data);
                }
            }).
            error(function(data) {
                console.log('ERROR ' + data);
            });
        }
    }
])

.controller('PageExitCtrl', function($scope, $ionicTabsDelegate, $state, $ionicScrollDelegate) {
    $scope.exitList = exitList;
    console.log("PageExitCtrl");
    var inactif = "button-outline";
    var iconActif1 = "ion-ios7-keypad";
    var iconInactif1 = "ion-ios7-keypad-outline";
    var iconActif2 = "ion-ios7-location";
    var iconInactif2 = "ion-ios7-location-outline";
    var txtSortie = "sortie";
    var txtEntree = "entrée";
    var titleDirect = "Trafic en direct";
    var titleCreate = "Création alerte";
    var titleUpdate = "Modification alerte";
    $scope.step = 1;
    $scope.button = "button button-calm icon-left";
    if (arb.action !== "setEnterAlert" && arb.action !== "setExitAlert"){
        currentAlert.rocade.enter = 0;
        currentAlert.rocade.exit = 0;
    }

    if (byNum) {
        $scope.actif1 = "";
        $scope.actif2 = inactif;
        $scope.icon1 = iconActif1;
        $scope.icon2 = iconInactif2;
        $scope.byNum = true;
        trackPage("SelectEnterByNum");
    } else {
        $scope.actif1 = inactif;
        $scope.actif2 = "";
        $scope.icon1 = iconInactif1;
        $scope.icon2 = iconActif2;
        $scope.byNum = false;
        trackPage("SelectEnterByName");
    }
    $scope.txtparam = txtEntree;
    $scope.title = titleDirect;
    $scope.isEnter = true;

    if (arb.action === "setEnterAlert") {
        $scope.nextStep = 'tabs.pageNewAlert';
        $scope.title = titleUpdate;
        $scope.step = 2;
    } else if (arb.action === "setExitAlert") {
        $scope.isEnter = false;
        $scope.txtparam = txtSortie;
        $scope.nextStep = 'tabs.pageNewAlert';
        $scope.title = titleUpdate;
        $scope.step = 2;
    } else if (arb.action === "createAlert") {
        $scope.title = titleCreate;
    }
    $scope.exitNameList = exitNameList;

    $scope.setMode = function(item) {
        if (item == 1) {
            $scope.actif1 = "";
            $scope.actif2 = inactif;
            $scope.icon1 = iconActif1;
            $scope.icon2 = iconInactif2;
            $scope.byNum = true;
            byNum = $scope.byNum;
        } else {
            $scope.actif1 = inactif;
            $scope.actif2 = "";
            $scope.icon1 = iconInactif1;
            $scope.icon2 = iconActif2;
            $scope.byNum = false;
            byNum = $scope.byNum;
        }
    }

    $scope.selectButton = function(item) {
        if ($scope.isEnter) {
            currentAlert.rocade.enter = item;
        } else {
            currentAlert.rocade.exit = item;
        }
        if (currentAlert.rocade.enter == currentAlert.rocade.exit) {
            currentAlert.rocade.exit = 0;
        } else {
            console.log('step : ' + $scope.step);
            if ($scope.step == 1) {
                $scope.step++;
                $scope.isEnter = false;
                $scope.txtparam = txtSortie;
                $ionicScrollDelegate.scrollTop();
            } else {
                if (arb.action == "getLiveTrafic") {
                    $scope.nextStep = 'tabs.pageTraficLive';
                }
                if (arb.action == "createAlert") {
                    $scope.nextStep = 'tabs.pageNewAlert';
                }
                console.log('$scope.nextStep : ' + $scope.nextStep);
                $state.go($scope.nextStep);
            }
        }
    }
    $scope.getClass = function(item) {
        if ((item === currentAlert.rocade.enter && $scope.isEnter) || (item === currentAlert.rocade.exit && !$scope.isEnter)) {
            return "button exitButton button-assertive";
        } else if (item === currentAlert.rocade.enter && !$scope.isEnter) {
            return "button button-positive exitButton";
        } else {
            return "button button-balanced exitButton";
        }
    }

})

.controller('pageTraficLiveCtrl', ['$scope', 'localStorageService', '$ionicLoading', 'GAEService', '$http', '$q', '$timeout',
    function($scope, localStorageService, $ionicLoading, GAEService, $http, $q, $timeout) {

        var alreadyExist = false;

        $scope.show = function() {
            $ionicLoading.show({
                template: 'Loading...'
            });
        };
        $scope.hide = function() {
            $ionicLoading.hide();
        };

        $scope.doRefresh = function() {
            trackPage("Refresh");
            var dataInput = JSON.stringify(currentAlert.rocade);
            var deferred = $q.defer();

            $http.jsonp("http://" + arb.serverUrl + "/getinforocade?data=" + dataInput + "&callback=JSON_CALLBACK", {
                    timeout: deferred.promise
                })
                .error(function(data) {
                    console.log('ERROR ' + data);
                })
                .finally(function() {
                    $scope.$broadcast('scroll.refreshComplete');
                })
                .then(function(server) {
                    $scope.hide();
                    $scope.displayResult(server.data);
                }, function(reject) {
                    // error handler            
                    if (reject.status === 0) {
                        // $http timeout
                        alert('Réseau indisponible');
                        $scope.hide();
                    } else {
                        alert('Réseau indisponible');
                        // response error status from server
                        $scope.hide();
                    }
                });

            $timeout(function() {
                deferred.resolve(); // this aborts the request!
            }, 5000);

        }

        $scope.displayResult = function(data) {
            var totalTime = exitTime["0"];
            var totalKm = exitKm["0"];
            var enter = parseInt(currentAlert.rocade.enter);
            var exit = parseInt(currentAlert.rocade.exit);
            var temps = 0;
            var km = 0;
            var paris = "Paris";
            var toulouse = "Toulouse";
            var merignac = "Mérignac";
            var inter0 = false;
            if (data.info.infoSensModel[0].name == "inter") {
                inter0 = true;
                if (enter < exit) {
                    temps = totalTime - exitTime[enter][exit - enter - 1];
                    km = totalKm - exitKm[enter][exit - enter - 1];
                } else {
                    temps = exitTime[exit][enter - exit - 1];
                    km = exitKm[exit][enter - exit - 1];
                }
            } else {
                if (enter < exit) {
                    temps = exitTime[enter][exit - enter - 1];
                    km = exitKm[enter][exit - enter - 1];
                } else {
                    temps = totalTime - exitTime[exit][enter - exit - 1];
                    km = totalKm - exitKm[exit][enter - exit - 1];
                }
            }
            temps = temps * data.info.infoSensModel[0].pcent / 100 + temps * 4.5 * (100 - data.info.infoSensModel[0].pcent) / 100;
            data.info.infoSensModel[0].temps = Math.ceil(temps / 60);
            data.info.infoSensModel[0].km = km.toFixed(1);
            if (data.info.infoSensModel.length > 1) {
                if (enter < exit) {
                    temps = exitTime[enter][exit - enter - 1];
                    km = exitKm[enter][exit - enter - 1];
                } else {
                    temps = totalTime - exitTime[exit][enter - exit - 1];
                    km = totalKm - exitKm[exit][enter - exit - 1];
                }
                temps = temps * data.info.infoSensModel[1].pcent / 100 + temps * 4.5 * (100 - data.info.infoSensModel[1].pcent) / 100;
                data.info.infoSensModel[1].temps = Math.ceil(temps / 60);
                data.info.infoSensModel[1].km = km.toFixed(1);
            }
            // Merignac
            if (enter < 11 && enter > 1) {
                if (inter0) {
                    data.info.infoSensModel[0].dir = paris;
                    if (data.info.infoSensModel.length > 1) {
                        data.info.infoSensModel[1].dir = merignac;
                    }
                } else {
                    data.info.infoSensModel[0].dir = merignac;
                }
            } else if (enter < 19 && enter > 11) {
                if (inter0) {
                    data.info.infoSensModel[0].dir = merignac;
                    if (data.info.infoSensModel.length > 1) {
                        data.info.infoSensModel[1].dir = toulouse;
                    }
                } else {
                    data.info.infoSensModel[0].dir = toulouse;
                }
            } else if (enter < 28 && enter > 19) {
                if (inter0) {
                    data.info.infoSensModel[0].dir = toulouse;
                    if (data.info.infoSensModel.length > 1) {
                        data.info.infoSensModel[1].dir = paris;
                    }
                } else {
                    data.info.infoSensModel[0].dir = paris;
                }
            } else if (enter == 11) {
                if (inter0) {
                    data.info.infoSensModel[0].dir = paris;
                    if (data.info.infoSensModel.length > 1) {
                        data.info.infoSensModel[1].dir = toulouse;
                    }
                } else {
                    data.info.infoSensModel[0].dir = toulouse;
                }
            } else if (enter == 19) {
                if (inter0) {
                    data.info.infoSensModel[0].dir = merignac;
                    if (data.info.infoSensModel.length > 1) {
                        data.info.infoSensModel[1].dir = paris;
                    }
                } else {
                    data.info.infoSensModel[0].dir = paris;
                }
            } else if (enter == 1) {
                if (inter0) {
                    data.info.infoSensModel[0].dir = toulouse;
                    if (data.info.infoSensModel.length > 1) {
                        data.info.infoSensModel[1].dir = merignac;
                    }
                } else {
                    data.info.infoSensModel[0].dir = merignac;
                }
            }
            $scope.data = data;
        }

        if (dataFromNotif === "") {
            $scope.show();
            $scope.currentAlert = currentAlert;
            //Sauvegarde des 4 dernières alertes
            if (saveInHistoric) {
                lastAlertList = localStorageService.get('lastAlertList');
                if (lastAlertList === null) {
                    lastAlertList = [];
                }

                //Vérif que la dernière recherche n'est pas déja présente
                for (var key in lastAlertList) {
                    if (lastAlertList[key].rocade.enter === currentAlert.rocade.enter && lastAlertList[key].rocade.exit === currentAlert.rocade.exit) {
                        alreadyExist = true;
                        break;
                    }
                }
                if (!alreadyExist) {
                    alreadyExist = false;
                    if (lastAlertList.length > 3) {
                        lastAlertList.shift();
                    }
                    lastAlertList.push(currentAlert);
                    localStorageService.set('lastAlertList', lastAlertList);
                }
            }
            saveInHistoric = true;
            $scope.doRefresh();
        } else {
            /*
            Lors de la notif, on passe par ici en premier mais dans la foulée on passe dans le if au dessus... Double appel //?
            */
            var tmp = dataFromNotif.info.infoSensModel[0];
            currentAlert.rocade.enter = tmp.troncons[0].sortie;
            currentAlert.rocade.exit = tmp.troncons[tmp.troncons.length - 1].sortie;
            $scope.currentAlert = currentAlert;
            $scope.displayResult(dataFromNotif);
            dataFromNotif = "";
        }
    }
])


.run(function($ionicPlatform, $location, $rootScope, localStorageService) {
    $ionicPlatform.ready(function() {
        console.log("run()");
        lastAlertList = localStorageService.get('lastAlertList');
        alertList = localStorageService.get('alertList');
        $ionicPlatform.onHardwareBackButton(function() {
            if ($location.$$path == '/tab/home') {
                ionic.Platform.exitApp();
            }
        })

        ionicPlatform = ionic.Platform;
        if (ionicPlatform.isIOS()) {
            setTimeout(function() {
                navigator.splashscreen.hide();
            }, 100);
            if (window.StatusBar) {
                window.StatusBar.overlaysWebView(true);
                window.StatusBar.styleLightContent();
            }
        }

        if (ionicPlatform.isWindowsPhone()) {
            platform = "wp";
        } else if (ionicPlatform.isAndroid()) {
            platform = "android";
        } else if (ionicPlatform.isIOS()) {
            platform = "ios";
        }

        if (platform != "PC" && platform != "wp") {
            gaPlugin = window.plugins.gaPlugin;
            gaPlugin.init(successHandler, errorHandler, "UA-55568400-1", 10);
        }
        $location.path('/tab/home');
        $rootScope.$apply();
    });
})

/* Ne sert pas?
function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}*/

var arb = {};

arb.serverUrl = "alerterocadebordeaux.appspot.com";
arb.iv = "F27D5C9927726BCEFE7510B1BDD3D137";
arb.salt = "3FF2EC019C627B945225DEBAD71A01B6985FE84C95A70EB132882F88C0A59A55";
arb.keySize = 128;
arb.iterations = arb.iterationCount = 10;
var lastAlertList;
var dateUserInfo = null;
var ionicPlatform = "";
var platform = "PC";
var gaPlugin;
var successHandler = function(result) {}
var errorHandler = function(result) {}
var trackPage = function(pageName) {
    if (platform != "PC" && platform != "wp") {
        gaPlugin.trackPage(successHandler, errorHandler, pageName);
    }
}

var exitList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27'];
var currentAlert = {
    "id": null,
    "rocade": {
        "enter": 0,
        "exit": 0
    }
};
var alertList = {};

var exitTime = {
    "0": [1880],
    "1": [24, 52, 206, 330, 373, 443, 543, 593, 666, 708, 783, 880, 985, 1069, 1139, 1209, 1264, 1304, 1409, 1464, 1514, 1564, 1684, 1732, 1796, 1844],
    "2": [28, 182, 306, 349, 419, 519, 569, 642, 684, 759, 856, 961, 1045, 1115, 1185, 1240, 1280, 1385, 1440, 1490, 1540, 1660, 1708, 1772, 1820],
    "3": [154, 278, 321, 391, 491, 541, 614, 656, 731, 828, 933, 1017, 1087, 1157, 1212, 1252, 1357, 1412, 1462, 1512, 1632, 1680, 1744, 1792],
    "4": [124, 167, 237, 337, 387, 460, 502, 577, 673, 779, 862, 932, 1002, 1057, 1097, 1202, 1257, 1307, 1357, 1477, 1525, 1589, 1637],
    "5": [43, 113, 213, 263, 336, 378, 453, 549, 655, 738, 808, 878, 933, 973, 1078, 1133, 1183, 1233, 1353, 1401, 1465, 1513],
    "6": [70, 170, 220, 293, 335, 410, 506, 612, 695, 765, 835, 890, 930, 1035, 1090, 1140, 1190, 1310, 1358, 1422, 1470],
    "7": [100, 150, 223, 265, 340, 436, 542, 625, 695, 765, 820, 860, 965, 1020, 1070, 1120, 1240, 1288, 1352, 1400],
    "8": [50, 123, 165, 240, 336, 442, 525, 595, 665, 720, 760, 865, 920, 970, 1020, 1140, 1188, 1252, 1300],
    "9": [73, 115, 190, 286, 392, 475, 545, 615, 670, 710, 815, 870, 920, 970, 1090, 1138, 1202, 1250],
    "10": [42, 117, 213, 319, 402, 472, 542, 597, 637, 742, 797, 847, 897, 1017, 1065, 1129, 1177],
    "11": [75, 171, 277, 360, 430, 500, 555, 595, 700, 755, 805, 855, 975, 1023, 1087, 1135],
    "12": [96, 202, 285, 355, 425, 480, 520, 625, 680, 730, 780, 900, 948, 1012, 1060],
    "13": [105, 189, 259, 329, 384, 424, 529, 584, 634, 684, 804, 852, 916, 964],
    "14": [84, 154, 224, 279, 319, 424, 479, 529, 579, 699, 747, 811, 859],
    "15": [70, 140, 195, 235, 340, 395, 445, 495, 615, 663, 727, 775],
    "16": [70, 125, 165, 270, 325, 375, 425, 545, 593, 657, 705],
    "17": [55, 95, 200, 255, 305, 355, 475, 523, 587, 635],
    "18": [40, 145, 200, 250, 300, 420, 468, 532, 580],
    "19": [105, 160, 210, 260, 380, 428, 492, 540],
    "20": [55, 105, 155, 275, 323, 387, 435],
    "21": [50, 100, 220, 268, 332, 380],
    "22": [50, 170, 218, 282, 330],
    "23": [120, 168, 232, 280],
    "24": [48, 112, 160],
    "25": [64, 112],
    "26": [48]
};
var exitKm = {
    "0": [44.4],
    "1": [0.6, 1.3, 4.3, 7.4, 8.5, 10.2, 12.7, 14, 15.8, 16.9, 18.7, 20.6, 22.7, 24.3, 26, 27.8, 29.2, 30.2, 32.8, 34.2, 35.4, 36.7, 39.7, 40.9, 42.5, 43.7],
    "2": [0.7, 3.7, 6.8, 7.9, 9.6, 12.1, 13.4, 15.2, 16.3, 18.1, 20, 22.1, 23.7, 25.4, 27.2, 28.6, 29.6, 32.2, 33.6, 34.8, 36.1, 39.1, 40.3, 41.9, 43.1],
    "3": [3, 6.1, 7.2, 8.9, 11.4, 12.7, 14.5, 15.6, 17.4, 19.3, 21.4, 23, 24.7, 26.5, 27.9, 28.9, 31.5, 32.9, 34.1, 35.4, 38.4, 39.6, 41.2, 42.4],
    "4": [3.1, 4.2, 5.9, 8.4, 9.7, 11.5, 12.6, 14.4, 16.3, 18.4, 20, 21.7, 23.5, 24.9, 25.9, 28.5, 29.9, 31.1, 32.4, 35.4, 36.6, 38.2, 39.4],
    "5": [1.1, 2.8, 5.3, 6.6, 8.4, 9.5, 11.3, 13.2, 15.3, 16.9, 18.6, 20.4, 21.8, 22.8, 25.4, 26.8, 28, 29.3, 32.3, 33.5, 35.1, 36.3],
    "6": [1.8, 4.3, 5.5, 7.3, 8.4, 10.3, 12.1, 14.2, 15.8, 17.6, 19.3, 20.7, 21.7, 24.3, 25.7, 26.9, 28.2, 31.2, 32.4, 34, 35.2],
    "7": [2.5, 3.8, 5.6, 6.6, 8.5, 10.4, 12.4, 14.1, 15.8, 17.6, 18.9, 19.9, 22.6, 23.9, 25.2, 26.4, 29.4, 30.6, 32.2, 33.4],
    "8": [1.3, 3.1, 4.1, 6, 7.9, 9.9, 11.6, 13.3, 15.1, 16.4, 17.4, 20.1, 21.4, 22.7, 23.9, 26.9, 28.1, 29.7, 30.9],
    "9": [1.8, 2.9, 4.8, 6.6, 8.7, 10.3, 12.1, 13.8, 15.2, 16.2, 18.8, 20.2, 21.4, 22.7, 25.7, 26.9, 28.5, 29.7],
    "10": [1.1, 2.9, 4.8, 6.9, 8.5, 10.2, 12, 13.4, 14.4, 17, 18.4, 19.6, 20.9, 23.9, 25.1, 26.7, 27.9],
    "11": [1.9, 3.8, 5.8, 7.4, 9.2, 10.9, 12.3, 13.3, 15.9, 17.3, 18.6, 19.8, 22.8, 24, 25.6, 26.8],
    "12": [1.9, 3.9, 5.6, 7.3, 9.1, 10.4, 11.4, 14.1, 15.4, 16.7, 17.9, 20.9, 22.1, 23.7, 24.9],
    "13": [2.1, 3.7, 5.4, 7.2, 8.6, 9.6, 12.2, 13.6, 14.8, 16.1, 19.1, 20.3, 21.9, 23.1],
    "14": [1.6, 3.4, 5.1, 6.5, 7.5, 10.1, 11.5, 12.8, 14, 17, 18.2, 19.8, 21],
    "15": [1.8, 3.5, 4.9, 5.9, 8.5, 9.9, 11.1, 12.4, 15.4, 16.6, 18.2, 19.4],
    "16": [1.8, 3.1, 4.1, 6.8, 8.1, 9.4, 10.6, 13.6, 14.8, 16.4, 17.6],
    "17": [1.4, 2.4, 5, 6.4, 7.6, 8.9, 11.9, 13.1, 14.7, 15.9],
    "18": [1, 3.6, 5, 6.3, 7.5, 10.5, 11.7, 13.3, 14.5],
    "19": [2.6, 4, 5.3, 6.5, 9.5, 10.7, 12.3, 13.5],
    "20": [1.4, 2.6, 3.9, 6.9, 8.1, 9.7, 10.9],
    "21": [1.3, 2.5, 5.5, 6.7, 8.3, 9.5],
    "22": [1.3, 4.3, 5.5, 7.1, 8.3],
    "23": [3, 4.2, 5.8, 7],
    "24": [1.2, 2.8, 4],
    "25": [1.6, 2.8],
    "26": [1.2]
};
//var device = null;
var byNum = true;
var saveInHistoric = true;
arb.action = "";
var dataFromNotif = "";
var exitNameList = [{
    "number": "1",
    "exitList": ['A10', 'Angoulême', 'La Rochelle', 'Paris']
}, {
    "number": "2",
    "exitList": ['Bordeaux-Bastide', 'Bassens', 'Carbon-Blanc', 'Lormont', 'Port et ZI d\'Ambès']
}, {
    "number": "3",
    "exitList": ['Pont d\'Aquitaine', 'Vieux Lormont']
}, {
    "number": "4",
    "exitList": ['Bordeaux-Centre', 'Bordeaux-Lac', 'Centre hôtelier du lac', 'Centre routier', 'Parc des expositions']
}, {
    "number": "5",
    "exitList": ['Bordeaux-Fret', 'ZI Bruges']
}, {
    "number": "6",
    "exitList": ['Blanquefort', 'Bruges', 'ZI Campilleau']
}, {
    "number": "7",
    "exitList": ['Eysines-Le Vigean', 'Le Bouscat', 'Le Taillan-Médoc']
}, {
    "number": "8",
    "exitList": ['Eysines-Centre', 'Lacanau', 'Le Taillan-Médoc', 'Le Verdon', 'Saint-Médard-en-Jalles']
}, {
    "number": "9",
    "exitList": ['Bordeaux-Caudéran', 'Le Haillan', 'Mérignac-Capeyron', 'Saint-Médard-en-Jalles']
}, {
    "number": "10",
    "exitList": ['Andernos', 'Cap-Ferret', 'Mérignac-Centre', 'Mérignac-Pichey']
}, {
    "number": "11",
    "exitList": ['Centre hôtelier', 'Mérignac Aéroport', 'Mérignac-Chemin Long', 'Parc d\'activités']
}, {
    "number": "12",
    "exitList": ['Parc cimetière', 'Saint-Jean-d\'Illac']
}, {
    "number": "13",
    "exitList": ['Pessac-Centre', 'Pessac-L\'Alouette']
}, {
    "number": "14",
    "exitList": ['Hôpitaux Haut-Lêveque Xavier Arzonan', 'Pessac-Saige', 'ZI Pessac']
}, {
    "number": "15",
    "exitList": ['A63', 'Arcachon', 'Bayonne', 'Canéjan', 'Cestas', 'Mont-de-Marsan', 'Saint-Sébastien']
}, {
    "number": "16",
    "exitList": ['Domaine Universitaire', 'Gradignan-Centre', 'Talence-Centre']
}, {
    "number": "17",
    "exitList": ['Gradignan-Malartic', 'Talence-Thouars', 'ZA Chanteloiseau']
}, {
    "number": "18",
    "exitList": ['Cadaujac', 'Léognan', 'Pont de la Maye', 'Villenave-d\'Ornon']
}, {
    "number": "19",
    "exitList": ['A62', 'Agen', 'Mont-de-Marsan', 'Pau', 'Saragosse', 'Toulouse']
}, {
    "number": "20",
    "exitList": ['Bègles', 'Centre Commercial Rives d\'Arcins']
}, {
    "number": "21",
    "exitList": ['Bordeaux-Centre', 'Gare St Jean', 'M.I.N.', 'Pont d\'Arcins', 'Pont François Mitterrand']
}, {
    "number": "22",
    "exitList": ['Floirac-La Souys', 'Latresne']
}, {
    "number": "23",
    "exitList": ['Bouliac', 'Floirac-Centre']
}, {
    "number": "24",
    "exitList": ['Bergerac', 'Haut-Floirac', 'Tresses']
}, {
    "number": "25",
    "exitList": ['Artigues-Centre', 'Cenon', 'ZI Artigues']
}, {
    "number": "26",
    "exitList": ['N89', 'Libourne', 'Périgueux', 'Yvrac']
}, {
    "number": "27",
    "exitList": ['Carbon-Blanc', 'Lormont']
}];
