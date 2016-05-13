/**
 * Created by tlh on 2016/5/13.
 */
$(document).ready(function () {
    $("#table").bootstrapTable({
        columns: [{
            title: '实验报告题目',
            field: 'name',
            align: 'center',
            width:  "10%" ,
            valign: 'middle',
        }, {
            title: '实验报告内容',
            field: 'content',
            align: 'center',
            width:  "15%" ,
            valign: 'middle'
        }, {
            title: '实验报告状态',
            field: 'status',
            align: 'center',
            valign: 'middle'
        }, {
            title: '指导老师',
            field: 'teacher.name',
            align: 'center',
            valign: 'middle',
        }, {
            title: '课程',
            field: 'lesson.name',
            align: 'center',
            valign: 'middle'
        }, {
            title: '布置时间',
            field: 'date_from',
            align: 'center',
            valign: 'middle',
            sortable:true
        }, {
            title: '截止时间',
            field: 'date_to',
            align: 'center',
            valign: 'middle',
            sortable:true
        }, {
            title: '注意事项',
            field: 'note',
            align: 'center',
            width:  "10px" ,
            valign: 'middle'
        }, {
            title: '模板',
            field: 'templateUrl',
            align: 'center',
            valign: 'middle',
            width:  "1%" ,
            formatter: templateUrlFormatter
        }, {
            title: '操作',
            align: 'center',
            valign: 'middle',
            events: operateEvents,
            formatter: operateFormatter
        }],
        // paginationFirstText:"首页",
        // paginationPreText:"上一页",
        // paginationNextText:"下一页",
        // paginationLastText:"末页",
        pageList: "[10,20,50,100]",
        toolbar: "#toolbar",
        search: "true",
        showRefresh: "true",
        showToggle: "true",
        showColumns: "true",
        showExport: "true",
        detailView: "true",
        detailFormatter: "detailFormatter",

        dataType: "json",
        url: "http://localhost:8080/ReportSystem/report/student/listAll.do",
        pagination: true,
        sidePagination: "server",
        pageSize: 10,
        queryParams: paginationParam,
        responseHandler: responseHandler
    });
});

function paginationParam(params) {
    return {
        userId: $.getUrlParam('userId'),
        itemNum: params.limit,
        page: $('#table').bootstrapTable('getOptions').pageNumber
    };
}

(function ($) {
    $.getUrlParam
        = function (name) {
        var reg
            = new RegExp("(^|&)" +
            name + "=([^&]*)(&|$)");
        var r
            = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
})(jQuery);
var pageData;
function responseHandler(sourceData) {
    if (sourceData.result == "success") {
        pageData = sourceData.data;
        for (var i = 0; i < pageData.length; i++) {
            if (pageData[i].location == 0) {
                pageData[i].location = "余区";
            } else {
                pageData[i].location = "马区";
            }
            switch (pageData[i].status) {
                case 0:
                    pageData[i].status = "未提交";
                    break;
                case 1:
                    pageData[i].status = "已提交";
                    break;
                case 2:
                    pageData[i].status = "已批改";
                    break;
            }
            if (pageData[i].date_from)
                pageData[i].date_from = pageData[i].date_from.split(" ")[0];
        }
        return {
            "total": sourceData.totalPages,
            "rows": pageData
        }
    } else {
        return {
            "total": 0,
            "rows": []
        }
    }
}

function detailFormatter(index, row) {
    var html = [];
    html.push('<ul>');
    $.each(row, function (key, value) {
        switch (key) {
            case 'name':
                html.push('<li><b>' + '实验报告题目' + ':</b> ' + value + '</li>');
                break;
            case 'content':
                html.push('<li><b>' + '实验报告内容' + ':</b> ' + value + '</li>');
                break;
            case 'note':
                html.push('<li><b>' + '注意事项' + ':</b> ' + value + '</li>');
                break;
            case 'lesson':
                html.push('<li><b>' + '课程' + ':</b> ' + value.name + '</li>');
                html.push('&nbsp;&nbsp;' + '年级' + ': ' + value.grade + '<br>');
                html.push('&nbsp;&nbsp;' + '学期' + ':' + value.term + '<br>');
                break;
            case 'teacher':
                html.push('<li><b>' + '指导老师' + ':</b> ' + value.name + '</li>');
                html.push('&nbsp;&nbsp;' + '学院' + ': ' + value.college + '<br>');
                var loc;
                if (value.location == 0)
                    loc = "余区";
                else loc = "马区";
                html.push('&nbsp;&nbsp;' + '校区' + ': ' + loc + '<br>');
                break;
            default:
                break;
        }
    });
    html.push('</ul>');
    return html.join('');
}


function templateUrlFormatter(value, row, index) {
    if (row.templateUrl) {
        return [
            '<a target="_blank" title="下载" href="' + row.templateUrl + '">',
            '<span class="fui-link"></span>',
            '</a>'
        ].join('');
    } else {
        return [
            '<a target="_blank" title="暂无资源，请联系指导老师" disabled>',
            '<span class="fui-link"></span>',
            '</a>'
        ].join('');
    }

}

function operateFormatter(value, row, index) {
    // return [
    //     '<span class="glyphicon glyphicon-download-alt"></span>',
    //     '<span class="glyphicon glyphicon-open"></span>'
    // ].join('');
    return [
        '<a class="download" href="javascript:void(0)" title="下载">',
        '<i class="glyphicon glyphicon-download-alt"></i>',
        '</a>  ',
        '<a class="upload" href="javascript:void(0)" title="上传提交">',
        '<i class="glyphicon glyphicon-open"></i>',
        '</a>'
    ].join('');
}
window.operateEvents = {
    'click .download': function (e, value, row, index) {
        if (row.url)
            window.open(row.url,"_blank");
    },
    'click .upload': function (e, value, row, index) {
        var a = row;
    }
};


$(function () {
    $('[data-toggle=tooltip]').tooltip();
});