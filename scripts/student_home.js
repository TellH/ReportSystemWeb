/**
 * Created by tlh on 2016/5/13.
 */
var selectedReportId;
$(document).ready(function () {
    $("#selected_file_name")[0].style.display = "none";
    var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',      // 上传模式,依次退化
        browse_button: 'pickfiles',         // 上传选择的点选按钮，**必需**
        // 在初始化时，uptoken, uptoken_url, uptoken_func 三个参数中必须有一个被设置
        uptoken_url: 'http://localhost:8080/ReportSystem/upload/getUpToken.do',         // Ajax 请求 uptoken 的 Url，**强烈建议设置**（服务端提供）
        get_new_uptoken: false,             // 设置上传文件的时候是否每次都重新获取新的 uptoken
        max_file_size: '100mb',
        domain: 'o762c73os.bkt.clouddn.com',     // bucket 域名，下载资源时用到，**必需**
        chunk_size: '4mb',                  // 分块上传时，每块的体积
        auto_start: false,                   // 选择文件后自动上传，若关闭需要自己绑定事件触发上传,
        init: {
            'FilesAdded': function (up, files) {
                var file = up.files[up.files.length - 1];
                var selectedFile = $("#selected_file_name")[0];
                selectedFile.style.display = "inline";
                selectedFile.innerText = file.name;
            },
            'UploadProgress': function (up, file) {
                // 每个文件上传时,处理相关的事情
                if (file.percent != 100)
                    NProgress.set(file.percent * 0.01);
            },
            'FileUploaded': function (up, file, info) {
                var domain = up.getOption('domain');
                var res = eval('(' + info + ')');
                var reportUrl = 'http://' + domain + '/' + res.key; //获取上传成功后的文件的Url
                console.log(reportUrl);
                $.ajax({
                    type: "POST",
                    url: "http://localhost:8080/ReportSystem/report/student/update.do",
                    dataType: 'json',
                    data: {
                        userId: $.getUrlParam('userId'),
                        password: $("#password_for_updateReport").val(),
                        reportId: selectedReportId,
                        docUrl: reportUrl
                    },
                    success: function (data) {
                        NProgress.done();
                        if (data.result == "failed") {
                            alert(data.msg);
                        } else if (data.result == "success") {
                            $('#uploadReportModal').modal('toggle');
                            alert(data.msg);
                        }
                    },
                    error: function (jqXHR) {
                        alert("似乎出现了些小问题,错误码：" + jqXHR.status);
                        NProgress.done();
                    }
                });
            },
            'Error': function (up, err, errTip) {
                //上传出错时,处理相关的事情
                alert(errTip);
            }
        }
    });
    uploader.bind('FilesAdded', function (uploader, file) {
        //确保每次选择文件只能添加一个文件，删掉前面添加的文件
        if (uploader.files.length > 1) {
            uploader.splice(0, uploader.files.length - 2);
        }
        var file = uploader.files[0];
        file.name = $.getUrlParam('userId') + selectedReportId + file.name;
    });

    $("#summit_report").click(function () {
        if (!validateForm($("#form_upload_report")[0])) {
            return;
        }
        uploader.start();
    });

    $("#summit_advice").click(function () {
        if (!validateForm($("#form_send_advice")[0])) {
            return;
        }
        $.ajax({
            type: "POST",
            url: "http://localhost:8080/ReportSystem/report/student/update.do",
            dataType: 'json',
            data: {
                userId: $.getUrlParam('userId'),
                password: $("#password").val(),
                reportId: selectedReportId,
                advice: $("#advice").val()
            },
            success: function (data) {
                NProgress.done();
                if (data.result == "failed") {
                    alert(data.msg);
                } else if (data.result == "success") {
                    alert(data.msg);
                }
                $('#updateAdviceModal').modal('toggle');
            },
            error: function (jqXHR) {
                NProgress.done();
                alert("似乎出现了些小问题,无法提交修改");
            }
        });
    });
    $("#table").bootstrapTable({
        columns: [{
            title: '实验报告题目',
            field: 'name',
            align: 'center',
            width: "20%",
            valign: 'middle'
        }, {
            title: '实验报告内容',
            field: 'content',
            align: 'center',
            width: "30%",
            valign: 'middle'
        }, {
            title: '指导老师',
            field: 'teacher.name',
            align: 'center',
            valign: 'middle'
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
            sortable: true
        }, {
            title: '截止时间',
            field: 'date_to',
            align: 'center',
            valign: 'middle',
            sortable: true
        }, {
            title: '注意事项',
            field: 'note',
            align: 'center',
            width: "20px",
            valign: 'middle'
        }, {
            title: '模板',
            field: 'templateUrl',
            align: 'center',
            valign: 'middle',
            width: "1%",
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
    NProgress.start();
    var html = [];
    html.push('<ul>');
    $.ajax({
        type: "POST",
        url: "http://localhost:8080/ReportSystem/report/student/detail.do",
        dataType: 'json',
        async: false,
        data: {
            userId: $.getUrlParam('userId'),
            reportId: row.reportId
        },
        success: function (data) {
            NProgress.done();
            if (data.result == "success") {
                var row = data.data[0];
                $.each(row, function (key, value) {
                    switch (key) {
                        case 'score':
                            html.push('<li><b>' + '分数' + ':</b> ' + value + '</li>');
                            break;
                        case 'comment':
                            html.push('<li><b>' + '老师评语' + ':</b> ' + value + '</li>');
                            break;
                        case 'advice':
                            html.push('<li><b>' + '你的反馈或建议' + ':</b> ' + value + '</li>');
                            break;
                        case 'name':
                            html.push('<li><b>' + '实验报告题目' + ':</b> ' + value + '</li>');
                            break;
                        case 'content':
                            html.push('<li><b>' + '实验报告内容' + ':</b> ' + value + '</li>');
                            break;
                        case 'note':
                            html.push('<li><b>' + '注意事项' + ':</b> ' + value + '</li>');
                            break;
                        case 'status':
                        {
                            switch (value) {
                                case 0:
                                    value = "未提交";
                                    break;
                                case 1:
                                    value = "已提交";
                                    break;
                                case 2:
                                    value = "已批改";
                                    break;
                                default:
                                    value = "未提交";
                                    break;
                            }
                            html.push('<li><b>' + '状态' + ':</b> ' + value + '</li>');
                            break;
                        }
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
            }
        },
        error: function (jqXHR) {
            NProgress.done();
            alert("似乎出现了些小问题,错误码：" + jqXHR.status);
        }
    });
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
        '</a>&nbsp;',
        '<a class="upload" href="javascript:void(0)" title="上传提交" data-toggle="modal" data-target="#uploadReportModal">',
        '<i class="glyphicon glyphicon-open"></i>',
        '</a>&nbsp;',
        '<a class="sendAdvice" href="javascript:void(0)" title="给老师留言" data-toggle="modal" data-target="#updateAdviceModal">',
        '<i class="glyphicon glyphicon-envelope"></i>',
        '</a>'
    ].join('');
}
window.operateEvents = {
    'click .download': function (e, value, row, index) {
        NProgress.start();
        $.ajax({
            type: "POST",
            url: "http://localhost:8080/ReportSystem/report/student/detail.do",
            dataType: 'json',
            async: false,
            data: {
                userId: $.getUrlParam('userId'),
                reportId: row.reportId
            },
            success: function (data) {
                NProgress.done();
                if (data.result == "success") {
                    if (data.data[0].docUrl){
                        window.open(data.data[0].docUrl, "_blank");
                    }else {
                        alert("你的实验报告还没提交呢！");
                    }
                }
            },
            error: function (jqXHR) {
                NProgress.done();
                alert("似乎出现了些小问题,错误码：" + jqXHR.status);
            }
        });
    },
    'click .upload': function (e, value, row, index) {
        selectedReportId = row.reportId;
    },
    'click .sendAdvice': function (e, value, row, index) {
        selectedReportId = row.reportId;
    }
};
function isFilled(field) {
    if (field.value.length < 1 || field.value == field.defaultValue) {
        return false;
    } else {
        return true;
    }
}
function validateForm(whichFrom) {
    for (var i = 0; i < whichFrom.elements.length; i++) {
        var element = whichFrom.elements[i];
        if (element.className.indexOf("required") != -1) {
            if (!isFilled(element)) {
                var id = element.id;
                if (element.name == "用户ID号") $('#login-id').tooltip('show');
                else $('#login-pass').tooltip('show');
                return false;
            }
        }
    }
    return true;
}

$(function () {
    $('[data-toggle=tooltip]').tooltip();
});
$(document).on('page:fetch', function () {
    NProgress.start();
});
$(document).on('page:change', function () {
    NProgress.done();
});
$(document).on('page:restore', function () {
    NProgress.remove();
});
NProgress.inc();