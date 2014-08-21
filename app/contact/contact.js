/**
 * Created by james on 19/08/14.
 */
var contact = angular.module('ehu.contact', []);

contact.controller('ContactCtrl', function ($scope, connection) {
    $scope.contacts = {}; // map jid: string -> {status: string, name: string}
    $scope.connection = connection;

    var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
    $scope.connection.sendIQ(iq, on_roster);

    $scope.connection.addHandler(on_roster_changed,
        "jabber:iq:roster", "iq", "set");

    function on_roster(iq) {
        console.log(iq);
        $(iq).find('item').each(function () {
            var jid = $(this).attr('jid');
            var name = $(this).attr('name') || jid;

            // transform jid into an id
            //var jid_id = Gab.jid_to_id(jid);
            var contact = {name: name};
            $scope.contacts[jid] = contact;
        });
        // Since this function is called by Strophe, outside of angular scope,
        // thus we need to force model update propagation.
        $scope.$apply('contacts');
        // set up presence handler and send initial presence
        $scope.connection.addHandler(on_presence, null, "presence");
        $scope.connection.send($pres());
    }

    function on_roster_changed(iq) {
        console.log('on_roster_changed');
        console.log(iq);
        $(iq).find('item').each(function () {
            var sub = $(this).attr('subscription');
            var jid = $(this).attr('jid');
            var name = $(this).attr('name') || jid;

            if (sub === 'remove') {
                // contact is being removed
                delete $scope.contacts[jid];
            } else {
                // contact is being added or modified
                $scope.contacts[jid].name = name;
            }
        });
        $scope.$apply('contacts');
        return true;
    }

    function on_presence(presence) {
        console.log('on_presence');
        console.log(presence);
        // extract info
        var ptype = $(presence).attr('type');
        var from = $(presence).attr('from');
        
        var jid = Strophe.getBareJidFromJid(from);
        var contact = $scope.contacts[jid];
        if (!contact) return true; // ignore unrecognized contacts.

        if (ptype === 'subscribe') {
            // TODO: This is a pending subscribe action, prompt a modal dialog to ask
            // the user for response.
        } else if (ptype !== 'error') {
            if (ptype === 'unavailable') {
                contact.status = "offline";
            } else {
                var show = $(presence).find("show").text();
                if (show === "" || show === "chat") {
                    contact.status = "online";
                } else {
                    contact.status = "away";
                }
            }
        }
        $scope.$apply('contacts');
        // The handler should return true if it is to be invoked again;
        // returning false will remove the handler after it returns.
        return true;
    }
});