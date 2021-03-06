'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('MainCtrl', function($scope, $resource, config, $rootScope, $q) {

    $rootScope.ready = false;

    /***** Load layout algorithm *******/
    var Layout = $resource(config.apiUrl + 'layoutAlgorithm');
    var layout = Layout.query();
    layout.$promise.then(function (result) {
      var layout = [];
      var layoutName = "";
      angular.forEach(result, function (value) {
        layoutName = "";
        angular.forEach(value, function (value2) {
          layoutName += value2;
        });
        layout.push(layoutName)
      });
      $rootScope.layout = layout;
      $rootScope.ready = true;
    });

    $rootScope.getDate = function (timestamp) {
            function complete(val) {
                if (val < 10)
                    return "0"+val;
                else
                    return val;
            };
            var date = new Date(timestamp);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' ' + complete(date.getHours()) + ':' + complete(date.getMinutes());
        };
    $rootScope.getSimpleDate = function (timestamp) {
            function complete(val) {
                if (val < 10)
                    return "0"+val;
                else
                    return val;
            };
            var date = new Date(timestamp);
            return complete(date.getDate()) + '/' + complete(date.getMonth()+1) + '/' + complete(date.getFullYear());
        };

    /***** Load all data *****/
    $rootScope.suggestions = [];


    $rootScope.resetSuggestions = function (users, posts, comments, tags) {
        var collectPromises = [];
        $rootScope.suggestions = [];
        // Create promises array to wait all data until load
        collectPromises.push($resource(config.apiUrl + 'users').query().$promise);
        collectPromises.push($resource(config.apiUrl + 'posts').query().$promise);
        collectPromises.push($resource(config.apiUrl + 'comments').query().$promise);
        collectPromises.push($resource(config.apiUrl + 'tags').query().$promise);

        $q.all(collectPromises).then(function (results) {
            if(users) {
                angular.forEach(results[0], function (user) {
                    user.label = user.label;
                    $rootScope.suggestions.push(user);
                });
            }
            if(posts) {
                angular.forEach(results[1], function (post) {
                    post.label = post.title;
                    $rootScope.suggestions.push(post);
                });
            }
            if(comments) {
                angular.forEach(results[2], function (comment) {
                    comment.label = comment.title;
                    $rootScope.suggestions.push(comment);
                });
            }
            if(tags) {
                angular.forEach(results[3], function (tag) {
                    $rootScope.suggestions.push(tag);
                });
            }
        }, function (reject) {
            console.log(reject);
        });
    };

    $rootScope.resetDetanglerSuggestions = function (users, tags, posts) {
        var collectPromises = [];
        // We use temp arrays so that the watcher corresponding to the suggestions will be trigered only when all the data are loaded.
        $rootScope.suggestionsUser_temp = [];
        $rootScope.suggestionsTag_temp = [];
        $rootScope.suggestionsPost_temp = [];
        $rootScope.suggestionsComment_temp = [];
        $rootScope.suggestionsUser = [];
        $rootScope.suggestionsTag = [];
        $rootScope.suggestionsPost = [];
        // Create promises array to wait all data until load
        collectPromises.push($resource(config.apiUrl + 'users').query().$promise);
        collectPromises.push($resource(config.apiUrl + 'tags').query().$promise);
        collectPromises.push($resource(config.apiUrl + 'posts').query().$promise);
        collectPromises.push($resource(config.apiUrl + 'comments').query().$promise);

        $q.all(collectPromises).then(function (results) {
            if(users) {
                angular.forEach(results[0], function (user) {
                    user.label = user.label;
                    $rootScope.suggestionsUser_temp.push(user);
                });
                $rootScope.suggestionsUser = $rootScope.suggestionsUser_temp;
            }
            if(tags) {
                angular.forEach(results[1], function (tag) {
                    $rootScope.suggestionsTag_temp.push(tag);
                    //console.log(tag)
                });
                $rootScope.suggestionsTag = $rootScope.suggestionsTag_temp;
            }
            if(posts) {
              //comments and post are put together
                angular.forEach(results[2], function (post) {
                    $rootScope.suggestionsPost_temp.push(post);
                    //console.log(post)
                });
                angular.forEach(results[3], function (comment) {
                    $rootScope.suggestionsPost_temp.push(comment);
                    //console.log(comment)
                });
                $rootScope.suggestionsPost = $rootScope.suggestionsPost_temp;
            }
        }, function (reject) {
            console.log(reject);
        });
    };

    //$rootScope.resetSuggestions(true, true, true, true);

    $rootScope.generateDownloadLinkForSigma = function (nodes, edges, name_file) {
        var tmp = [];
        var x;
        var line_csv;
        var nb_nodes_hidden = 0;
        var nodes_json = [];
        var nodes_csv = '';
        var nodes_csv_partial = '';
        var tlp_file = '(tlp "2.3"\n(comments "This file was generated by GraphRyder.")\n(nb_nodes '+nodes.length+')\n(nodes';
        var tlp_properties = [];
        var nodes_tlp = '';
        var tmp_head = nodes[1];
        //var name_file = 'tag_view';
        for (x in tmp_head) {
            nodes_csv+='"'+x.replace(/"/g, "'")+'",';
            tlp_properties[x] = '(property 0 string "'+x.replace(/"/g, "'")+'"\n(default "" "")\n';
        }
        tlp_properties['viewLayout'] = '(property 0 layout "viewLayout"\n(default "(0,0,0)" "()")\n';
        tlp_properties['viewLabel'] = '(property 0 string "viewLabel"\n(default "" "")\n';
        tlp_properties['viewSize'] = '(property  0 size "viewSize"\n(default "(1,1,1)" "(0.125,0.125,0.5)")\n';
        tlp_properties['viewShape'] = '(property 0 int "viewShape"\n(default "14" "0")\n)\n';
        tlp_properties['viewColor'] = '(property  0 color "viewColor"\n(default "(255,95,95,255)" "(180,180,180,255)")\n';
        nodes_csv=nodes_csv.slice(0,-1)+'\n';
        nodes_csv_partial=nodes_csv;
        for (var i=0;i<nodes.length; i++) {
            tmp = nodes[i];
            nodes_json.push(JSON.stringify(tmp));
            line_csv = '';
            for (x in tmp_head) {
                line_csv+='"'+new String(tmp[x]).replace(/"/g, "'")+'",';
                tlp_properties[x] += '(node '+tmp['id']+' "'+new String(tmp[x]).replace(/"/g, "'")+'")\n'
            }
            tlp_properties['viewLayout'] += '(node '+tmp['id']+' "('+tmp['x']*5+','+tmp['y']*-5+',0)")\n';
            tlp_properties['viewLabel'] += '(node '+tmp['id']+' "'+new String(tmp['label']).replace(/"/g, "'")+'")\n';
            tlp_properties['viewSize'] += '(node '+tmp['id']+' "('+tmp['size']+','+tmp['size']+',1)")\n';
            tlp_properties['viewColor'] += '(node '+tmp['id']+' "('+tmp['color'].slice(4,-1)+',255)")\n';
            nodes_csv+=line_csv.slice(0,-1)+'\n';
            if (!(tmp['hidden'] == true)) {
                nodes_csv_partial+=line_csv.slice(0,-1)+'\n';
                nodes_tlp += ' '+tmp['id'];
                nb_nodes_hidden++;
            }
            tlp_file += ' '+tmp['id'];
        }
        tlp_file += ')\n(nb_edges '+edges.length+')\n';
        var edges_json = [];
        var edges_csv = '';
        var edges_csv_partial = '';
        var edges_tlp = '';
        var nb_edges_hidden = 0;
        tmp_head = edges[1];
        for (x in tmp_head) {
            edges_csv+='"'+x.replace(/"/g, "'")+'",';
            if ((x in tlp_properties) == false) {
                tlp_properties[x] = '(property 0 string "'+x.replace(/"/g, "'")+'"\n(default "" "")\n';
            }
        }
        edges_csv=edges_csv.slice(0,-1)+'\n';
        edges_csv_partial=edges_csv;
        for (var i=0;i<edges.length; i++) {
            tmp = edges[i];
            edges_json.push(JSON.stringify(tmp));
            line_csv = '';
            for (x in tmp_head) {
                line_csv+='"'+new String(tmp[x]).replace(/"/g, "'")+'",';
                tlp_properties[x] += '(edge '+tmp['id']+' "'+new String(tmp[x]).replace(/"/g, "'")+'")\n'
            }
            edges_csv+=line_csv.slice(0,-1)+'\n';
            tlp_file += '(edge '+tmp['id']+' '+tmp['source']+' '+tmp['target']+')\n';
            if (!(tmp['hidden'] == true)) {
                edges_csv_partial+=line_csv.slice(0,-1)+'\n';
                edges_tlp += ' '+tmp['id'];
                nb_edges_hidden++;
            }
        }
        tlp_file += '(graph_attributes 0\n(string "name" "'+name_file+'")\n)\n';
        if ('hidden' in tmp_head && nb_nodes_hidden < nodes.length && nb_edges_hidden < edges.length) {
            tlp_file += "(cluster 1\n(nodes"+nodes_tlp+')\n(edges'+edges_tlp+')\n)\n(graph_attributes 1\n(string "name" "partial")\n)\n';
        }
        for (x in tlp_properties) {
            tlp_file += tlp_properties[x]+')\n';
        }
        tlp_file += ')';
        var properties = {type: 'application/json'}; // Specify the file's mime-type.
        //try {
          // Specify the filename using the File constructor, but ...
        //  var file_nodes_json = new File(nodes_json, "tag_view_full_nodes.json", properties);
        //  var file_edges_json = new File(edges_json, "tag_view_full_edges.json", properties);
        //} catch (e) {
          // ... fall back to the Blob constructor if that isn't supported.
          var file_nodes_json = new Blob(nodes_json, properties);
          var file_edges_json = new Blob(edges_json, properties);
          var file_nodes_csv = new Blob([nodes_csv], properties);
          var file_edges_csv = new Blob([edges_csv], properties);
          var file_nodes_csv_partial = new Blob([nodes_csv_partial], properties);
          var file_edges_csv_partial = new Blob([edges_csv_partial], properties);
          var file_tlp = new Blob([tlp_file], {type: 'application/tlp'});
        //}
        var url_nodes_json = URL.createObjectURL(file_nodes_json);
        var url_edges_json = URL.createObjectURL(file_edges_json);
        var url_nodes_csv = URL.createObjectURL(file_nodes_csv);
        var url_edges_csv = URL.createObjectURL(file_edges_csv);
        var url_nodes_csv_partial = URL.createObjectURL(file_nodes_csv_partial);
        var url_edges_csv_partial = URL.createObjectURL(file_edges_csv_partial);
        var url_tlp = URL.createObjectURL(file_tlp);
        var html_json = 'JSON (complete): <a target="_blank" class="btn btn-default" download="'+name_file+'_nodes.json" href="'+url_nodes_json+'" >Nodes</a>&nbsp;|&nbsp;<a target="_blank" class="btn btn-default" download="'+name_file+'_edges.json" href="'+url_edges_json+'" >Edges</a>';
        var html_csv = 'CSV (complete): <a target="_blank" class="btn btn-default" download="'+name_file+'_nodes.csv" href="'+url_nodes_csv+'" >Nodes</a>&nbsp;|&nbsp;<a target="_blank" class="btn btn-default" download="'+name_file+'_edges.csv" href="'+url_edges_csv+'" >Edges</a>';
        var html_csv_partial = 'CSV (partial): <a target="_blank" class="btn btn-default" download="'+name_file+'_nodes_partial.csv" href="'+url_nodes_csv_partial+'" >Nodes</a>&nbsp;|&nbsp;<a target="_blank" class="btn btn-default" download="'+name_file+'_edges_partial.csv" href="'+url_edges_csv_partial+'" >Edges</a>';
        var html_tlp = 'TLP (both): <a target="_blank" class="btn btn-default" download="'+name_file+'.tlp" href="'+url_tlp+'" >All</a>';
        $("#download_link_dialog").html(html_json+"<br/>"+html_csv+"<br/>"+html_csv_partial+"<br/>"+html_tlp);
        return(html_json+"<br/>"+html_csv+"<br/>"+html_csv_partial+"<br/>"+html_tlp);
    }

  });
