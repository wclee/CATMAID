/** Namespace NotificationsTable */
var NotificationsTable = new function()
{
  var ns = this; // reference to the namespace
  ns.oTable = null;
  var asInitVals = [];

  /** Update the table to list the notifications. */
  this.update = function() {
      ns.oTable.fnClearTable( 0 );
      ns.oTable.fnDraw();
  };

  /** Update the table to list the notifications. */
  refresh_notifications = function() {
    if (ns.oTable) {
      ns.oTable.fnClearTable( 0 );
      ns.oTable.fnDraw();
    }
  };
  
  this.approve = function(changeRequestID) {
    requestQueue.register(django_url + project.id + '/changerequest/approve', "POST", {
      "id": changeRequestID
    }, function (status, text, xml) {
      if (status == 200) {
        if (text && text != " ") {
          var jso = $.parseJSON(text);
          if (jso.error) {
            alert(jso.error);
          }
          else {
            refresh_notifications();
          }
        }
      }
      else if (status == 500) {
        win = window.open('', '', 'width=1100,height=620');
        win.document.write(text);
        win.focus();
      }
      return true;
    });
  };
  
  this.reject = function(changeRequestID) {
    requestQueue.register(django_url + project.id + '/changerequest/reject', "POST", {
      "id": changeRequestID
    }, function (status, text, xml) {
      if (status == 200) {
        if (text && text != " ") {
          var jso = $.parseJSON(text);
          if (jso.error) {
            alert(jso.error);
          }
          else {
            refresh_notifications();
          }
        }
      }
      else if (status == 500) {
        win = window.open('', '', 'width=1100,height=620');
        win.document.write(text);
        win.focus();
      }
      return true;
    });
  };
  
  this.perform_action = function(row_index) {
    var node = document.getElementById('action_select_' + row_index);

    if (node && node.tagName == "SELECT") {
      var row_data = ns.oTable.fnGetData(row_index);
      var action = node.options[node.selectedIndex].value;
      if (action == 'Show') {
        project.moveTo(row_data[6], row_data[5], row_data[4], undefined, function () {SkeletonAnnotations.staticSelectNode(row_data[7], row_data[8]);});
      }
      else if (action == 'Approve') {
        NotificationsTable.approve(row_data[0]);
      }
      else if (action == 'Reject') {
        NotificationsTable.reject(row_data[0]);
      }
      node.selectedIndex = 0;
    }
  };
  
  this.init = function (pid)
  {
    ns.pid = pid;
    ns.oTable = $('#notificationstable').dataTable({
      // http://www.datatables.net/usage/options
      "bDestroy": true,
      "sDom": '<"H"lr>t<"F"ip>',
      // default: <"H"lfr>t<"F"ip>
      "bProcessing": true,
      "bServerSide": true,
      "bAutoWidth": false,
      "sAjaxSource": django_url + project.id + '/notifications/list',
      "fnServerData": function (sSource, aoData, fnCallback) {
        $.ajax({
          "dataType": 'json',
          "type": "POST",
          "cache": false,
          "url": sSource,
          "data": aoData,
          "success": fnCallback
        });
      },
      "iDisplayLength": -1,
      "aLengthMenu": [
        [-1, 10, 100, 200],
        ["All", 10, 100, 200]
      ],
      "bJQueryUI": true,
      "aoColumns": [{
        "bSearchable": false,
        "bSortable": true,
        "bVisible": false
      }, // id
      {
        "sClass": "center",
        "bSearchable": true,
        "bSortable": false,
      }, // type
      {
        "bSearchable": false,
        "bSortable": false,
      }, // description
      {
        "sClass": "center",
        "bSearchable": true,
        "bSortable": true,
        "sWidth": "120px"
      }, // status
      {
        "bSearchable": false,
        "bVisible": false
      }, // x
      {
        "bSearchable": false,
        "bVisible": false
      }, // y
      {
          "bSearchable": false,
        "bVisible": false
      }, // z
      {
        "bSearchable": false,
        "bVisible": false
      }, // node_id
      {
          "bSearchable": false,
        "bVisible": false
      }, // skeleton_id
      {
        "bSearchable": true,
        "bSortable": true
      }, // from
      {
        "bSearchable": false,
        "bSortable": true,
        "sWidth": "100px"
      }, // date
      {
        "sClass": "center",
        "bSearchable": false,
        "bSortable": false,
        "mDataProp": null,
        "fnRender" : function(obj) {
           var disabled = (obj.aData[3] == 'Open' ? '' : ' disabled');
           return '<select id="action_select_' + obj.iDataRow + '" onchange="NotificationsTable.perform_action(' + obj.iDataRow + ')">' + 
                  '  <option>Action:</option>' + 
                  '  <option>Show</option>' + 
                  '  <option' + disabled + '>Approve</option>' + 
                  '  <option' + disabled + '>Reject</option>' + 
                  '</select>'
        },
        "sWidth": "100px"
      } // actions
      ]
    });

    // filter table
    $.each(asInitVals, function(index, value) {
      if(value==="Search")
        return;
      if(value) {
        ns.oTable.fnFilter(value, index);
      }
    });

    $("#notificationstable thead input").keyup(function () { /* Filter on the column (the index) of this element */
      var i = $("thead input").index(this) + 2;
      asInitVals[i] = this.value;
      ns.oTable.fnFilter(this.value, i);
    });

    $("#notificationstable thead input").each(function (i) {
      asInitVals[i+2] = this.value;
    });

    $("#notificationstable thead input").focus(function () {
      if (this.className === "search_init") {
        this.className = "";
        this.value = "";
      }
    });

    $("#notificationstable thead input").blur(function (event) {
      if (this.value === "") {
        this.className = "search_init";
        this.value = asInitVals[$("thead input").index(this)+2];
      }
    });

    $('select#search_type').change( function() {
      ns.oTable.fnFilter( $(this).val(), 1 );
      asInitVals[1] = $(this).val();
    });
  };
}
