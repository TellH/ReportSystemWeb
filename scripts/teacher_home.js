/**
 * Created by tlh on 2016/5/13.
 */
var preUrl = 'http://localhost:8080/ReportSystem/';
var selectedReportId;
var selectedTerm;
var selectedLesson;
var selectedRow;
var pageData;
var table;
var returnTemplateUrl;
var userId;
$(document).ready(function () {
    userId = $.getUrlParam('userId');
    initNavigationBar();
    $('#deadline').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true
    });
    table = $('#table');
    list(preUrl + 'report/teacher/listAll.do', getListAllParam);
    $("#selected_file_name")[0].style.display = "none";
    var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',      // 上传模式,依次退化
        browse_button: 'pickfiles',         // 上传选择的点选按钮，**必需**
        // 在初始化时，uptoken, uptoken_url, uptoken_func 三个参数中必须有一个被设置
        uptoken_url: preUrl + 'upload/getUpToken.do',         // Ajax 请求 uptoken 的 Url，**强烈建议设置**（服务端提供）
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
                returnTemplateUrl = 'http://' + domain + '/' + res.key; //获取上传成功后的文件的Url
                updateTemplateUrl();
            },
            'Error': function (up, err, errTip) {
                //上传出错时,处理相关的事情
                notice("上传失败，" + errTip, 'error');
            }
        }
    });
    uploader.bind('FilesAdded', function (uploader, file) {
        //确保每次选择文件只能添加一个文件，删掉前面添加的文件
        if (uploader.files.length > 1) {
            uploader.splice(0, 1);
        }
        var file = uploader.files[0];
        file.name = userId + selectedReportId + file.name;
    });
    $("#summit_template").click(function () {
        if (NProgress.isStarted()) {
            notice("我们在为您拼命加载中，请您耐心等待！Loading...", 'info');
            return;
        }
        if (!validateForm($("#form_upload_template")[0])) {
            return;
        }
        if (!returnTemplateUrl)
            uploader.start();
        else {
            NProgress.start();
            updateTemplateUrl();
        }
    });
    $("#confirmToDelete").click(function () {
        if (NProgress.isStarted()) {
            notice("我们在为您拼命加载中，请您耐心等待！Loading...", 'info');
            return;
        }
        if (!validateForm($("#form_delete_report")[0])) {
            return;
        }
        NProgress.start();
        $.ajax({
            type: "POST",
            url: preUrl + "report/teacher/delete.do",
            dataType: 'json',
            data: {
                userId: userId,
                reportId: selectedReportId,
                password: $("#password_for_deleteReport").val()
            },
            success: function (data) {
                NProgress.done();
                if (data.result == "success") {
                    notice(data.msg, 'success');
                    table.refresh();
                    $("#deleteReportModal").hide();
                } else {
                    notice(data.msg, 'error');
                }
            },
            error: function (jqXHR) {
                NProgress.done();
                notice("似乎出现了些小问题,无法删除，请稍后再试~", 'error');
            }
        });
    });
    $("#btn_addReport").click(function () {
        window.open("add_report.html?userId=" + userId + "&identity=" + 1, "_blank");
    });
    $(".navbar-brand").attr("href", preUrl);
});

function updateTemplateUrl() {
    $.ajax({
        type: "POST",
        url: preUrl + "report/teacher/update.do",
        dataType: 'json',
        data: {
            userId: userId,
            password: $("#password_for_updateTemplate").val(),
            reportId: selectedReportId,
            templateUrl: returnTemplateUrl
        },
        success: function (data) {
            NProgress.done();
            if (data.result == "failed") {
                notice(data.msg, 'error');
            } else if (data.result == "success") {
                $('#uploadTemplateModal').modal('toggle');
                notice(data.msg, 'success');
            }
        },
        error: function (jqXHR) {
            NProgress.done();
            notice("似乎出现了些小问题,错误码：" + jqXHR.status, 'error');
        }
    });
}
function list(url, getParams) {
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
        url: url,
        pagination: true,
        sidePagination: "server",
        pageSize: 5,
        queryParams: getParams,
        responseHandler: responseHandler
    });
}
function initNavigationBar() {
    addTermListItem();
    addLessonListItem();
    $("#btn_logout").click(function () {
        if (NProgress.isStarted()) {
            notice("我们在为您拼命加载中，请您耐心等待！Loading...", 'info');
            return;
        }
        NProgress.start();
        $.ajax({
            type: "POST",
            url: preUrl + "account/logout.do",
            dataType: 'json',
            success: function (data) {
                NProgress.done();
                if (data.result == "failed") {
                    notice(data.msg, 'error');
                } else {
                    window.open("login.html", "_self");
                }
            },
            error: function (jqXHR) {
                NProgress.done();
                notice("似乎出现了些小问题,无法注销", 'error');
            }
        })
    });
    $("#listAll").click(function () {
        switchTab($(this));
        NProgress.start();
        table.bootstrapTable('refresh', getListAllParam());
    });
    $.ajax({
        type: "POST",
        url: preUrl + "account/getInfo.do",
        dataType: 'json',
        data: {
            userId: userId,
            identity: $.getUrlParam('identity')
        },
        success: function (data) {
            if (data.result == "success") {
                var userName = data.user.name;
                $("#welcome")[0].innerText = 'hi!  ' + userName + '老师';
            } else {
                notice(data.msg, 'info');
            }
        }
    });


}
function switchTab(tab) {
    $("li").removeClass('active');
    tab.addClass('active');
}
function addLessonListItem() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var thisTerm;
    if (month > 1 && month < 8) {
        thisTerm = year - 1 + '-2';
    } else {
        thisTerm = year + '-1';
    }
    $.ajax({
        type: "POST",
        url: preUrl + "lesson/listByTerm4Teacher.do",
        dataType: 'json',
        data: {
            userId: userId,
            term: thisTerm
        },
        success: function (data) {
            if (data.result == "success") {
                var lesson_selector = $("#lesson_selector")[0];
                var lessons = data.data;
                for (var i = 0; i < lessons.length; i++) {
                    var lesson = lessons[i];
                    var item = document.createElement("li");
                    item.setAttribute('value', lesson.id);
                    var a2 = document.createElement('a');
                    a2.href = '#';
                    a2.appendChild(document.createTextNode(lesson.name + " " + lesson.grade));
                    item.appendChild(a2);
                    lesson_selector.appendChild(item);
                    item.onclick = onclickLessonListItem;
                }
            }
        }
    });
}
function addTermListItem() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var termSelector = $("#term_selector")[0];
    var child1 = document.createElement("li");
    if (month > 1 && month < 8) {
        child1.setAttribute('value', year - 1 + '-2');
        var a1 = document.createElement('a');
        a1.appendChild(document.createTextNode((year - 1) + '年第二学期'));
        a1.href = '#';
        child1.appendChild(a1);
        child1.onclick = onclickTermListItem;
        termSelector.appendChild(child1);
        var child2 = document.createElement("li");
        child2.setAttribute('value', year - 1 + '-1');
        var a2 = document.createElement('a');
        a2.href = '#';
        a2.appendChild(document.createTextNode((year - 1) + '年第一学期'));
        child2.appendChild(a2);
        termSelector.appendChild(child2);
        child2.onclick = onclickTermListItem;
        var child3 = document.createElement("li");
        child3.setAttribute('value', year - 2 + '-2');
        var a3 = document.createElement('a');
        a3.href = '#';
        a3.appendChild(document.createTextNode(year - 2 + '年第二学期'));
        child3.appendChild(a3);
        termSelector.appendChild(child3);
        child3.onclick = onclickTermListItem;
        var child4 = document.createElement("li");
        child4.setAttribute('value', year - 2 + '-1');
        var a4 = document.createElement('a');
        a4.href = '#';
        a4.appendChild(document.createTextNode(year - 2 + '年第一学期'));
        child4.appendChild(a4);
        child4.onclick = onclickTermListItem;
        termSelector.appendChild(child4);
    } else {
        child1.setAttribute('value', year + '-1');
        var a1 = document.createElement('a');
        a1.href = '#';
        a1.appendChild(document.createTextNode((year) + '年第一学期'));
        child1.appendChild(a1);
        termSelector.appendChild(child1);
        child1.onclick = onclickTermListItem;
        var child2 = document.createElement("li");
        child2.setAttribute('value', year - 1 + '-2');
        var a2 = document.createElement('a');
        a2.href = '#';
        a2.appendChild(document.createTextNode(year - 1 + '年第二学期'));
        child2.appendChild(a2);
        termSelector.appendChild(child2);
        child2.onclick = onclickTermListItem;
        var child3 = document.createElement("li");
        child3.setAttribute('value', year - 1 + '-1');
        var a3 = document.createElement('a');
        a3.href = '#';
        a3.appendChild(document.createTextNode(year - 1 + '年第一学期'));
        child3.appendChild(a3);
        child3.onclick = onclickTermListItem;
        termSelector.appendChild(child3);
    }
}
function onclickTermListItem() {
    switchTab($("#listByTerm"));
    selectedTerm = $(this).attr('value');
    NProgress.start();
    table.bootstrapTable('refresh', getListByTermParam());
}
function onclickLessonListItem() {
    switchTab($("#listByLesson"));
    selectedLesson = $(this).attr('value');
    NProgress.start();
    table.bootstrapTable('refresh', getListByLessonParam());
}
function getListAllParam(params) {
    if (!params) {
        return {
            url: preUrl + "report/teacher/listAll.do",
            query: {
                userId: userId,
                itemNum: table.bootstrapTable('getOptions').pageSize,
                page: table.bootstrapTable('getOptions').pageNumber
            }
        }
    }
    return {
        userId: userId,
        itemNum: params.limit,
        page: table.bootstrapTable('getOptions').pageNumber
    };
}
function getListByTermParam() {
    return {
        url: preUrl + "report/teacher/listByTerm.do",
        query: {
            userId: userId,
            term: selectedTerm,
            itemNum: table.bootstrapTable('getOptions').pageSize,
            page: table.bootstrapTable('getOptions').pageNumber
        }
    };
}
function getListByLessonParam() {
    return {
        url: preUrl + "report/teacher/listByLesson.do",
        query: {
            userId: userId,
            lessonId: selectedLesson,
            itemNum: table.bootstrapTable('getOptions').pageSize,
            page: table.bootstrapTable('getOptions').pageNumber
        }
    };
}
function responseHandler(sourceData) {
    NProgress.done();
    if (sourceData.result == "success") {
        pageData = sourceData.data;
        for (var i = 0; i < pageData.length; i++) {
            if (pageData[i].location == 0) {
                pageData[i].location = "余区";
            } else {
                pageData[i].location = "马区";
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
    var row = pageData[index];
    $.each(row, function (key, value) {
        switch (key) {
            case 'name':
                html.push('<li><b>' + '实验报告题目' + ':</b> ' + value + '</li>');
                break;
            case 'location':
                html.push('<li><b>' + '校区' + ':</b> ' + value + '</li>');
                break;
            case 'content':
                html.push('<li><b>' + '实验报告内容' + ':</b> ' + value + '</li>');
                break;
            case 'note':
                html.push('<li><b>' + '注意事项' + ':</b> ' + value + '</li>');
                break;
            case 'major':
                html.push('<li><b>' + '专业' + ':</b> ' + value + '</li>');
                break;
            case 'date_from':
                html.push('<li><b>' + '布置时间：' + ':</b> ' + value + '</li>');
                break;
            case 'date_to':
                html.push('<li><b>' + '截止提交时间：' + ':</b> ' + value + '</li>');
                break;
            case 'college':
                html.push('<li><b>' + '学院：' + ':</b> ' + value + '</li>');
                break;
            case 'lesson':
                html.push('<li><b>' + '课程' + ':</b> ' + value.name + '</li>');
                html.push('&nbsp;&nbsp;' + '年级' + ': ' + value.grade + '<br>');
                html.push('&nbsp;&nbsp;' + '学期' + ':' + value.term + '<br>');
                break;
            default:
                break;
        }
    });
    html.push('</ul>');
    return html.join('');
}

function operateFormatter(value, row, index) {
    return [
        '<a class="download" href="javascript:void(0)" title="下载模板">',
        '<i class="glyphicon glyphicon-download-alt"></i>',
        '</a>&nbsp;',
        '<a class="upload" href="javascript:void(0)" title="上传模板" data-toggle="modal" data-target="#uploadTemplateModal">',
        '<i class="glyphicon glyphicon-open"></i>',
        '</a>&nbsp;',
        '<a class="update" href="javascript:void(0)" title="编辑实验报告" data-toggle="modal" data-target="#updateReportModal">',
        '<i class="glyphicon glyphicon-pencil"></i>',
        '</a>&nbsp;',
        '<a class="score" href="javascript:void(0)" target="_blank" title="批改实验报告">',
        '<i class="material-icons">spellcheck</i>',
        '</a>&nbsp;',
        '<a class="delete" href="javascript:void(0)" title="删除实验报告" data-toggle="modal" data-target="#deleteReportModal">',
        '<i class="glyphicon glyphicon-remove"></i>',
        '</a>'
    ].join('');
}
function initUpdateReportModel(row) {
    $("#inputReportTitle").val('');
    $("#content").val('');
    $("#note").val('');
    $("#college").val('');
    $("#major").val('');
    $("#deadline").val('');

    $("#inputReportTitle").val(row.name);
    $("#content").val(row.content);
    $("#note").val(row.note);
    $("#college").val(row.college);
    $("#major").val(row.major);
    $("#deadline").val(row.date_to);
    if (row.location == '余区') {
        $("#optionsRadios1").attr('checked', true);
        $("#optionsRadios2").attr('checked', false);
    } else {
        $("#optionsRadios1").attr('checked', false);
        $("#optionsRadios2").attr('checked', true);
    }
    $("#btn_update_report").click(function () {
        if (NProgress.isStarted()) {
            notice("我们在为您拼命加载中，请您耐心等待！Loading...", 'info');
            return;
        }
        if (!validateForm($("#form_update_report")[0])) {
            return;
        }
        NProgress.start();
        $.ajax({
            type: "POST",
            url: preUrl + "report/teacher/update.do",
            dataType: 'json',
            data: validateUpdateReportForm(),
            success: function (data) {
                NProgress.done();
                if (data.result == "success") {
                    notice(data.msg, 'success');
                    $("#updateReportModal").hide();
                    table.refresh();
                } else {
                    notice(data.msg, 'error');
                }
            },
            error: function (jqXHR) {
                NProgress.done();
                notice("似乎出现了些小问题,无法更新，请稍后再试~", 'error');
            }
        });
    });
}
function validateUpdateReportForm() {
    var params = {
        userId: userId,
        password: $("#inputPassword").val(),
        reportId: selectedReportId
    };
    var inputContent = $("#content");
    if (selectedRow.content != inputContent.val() && inputContent.val() != '') params.content = inputContent.val();
    var inputReportTitle = $("#inputReportTitle");
    if (selectedRow.name != inputReportTitle.val() && inputReportTitle.val() != '') params.reportName = inputReportTitle.val();
    var timepicker = $("#deadline");
    if (selectedRow.date_to != timepicker.val() && timepicker.val() != '') params.deadline = timepicker.val();
    var inputNote = $("#note");
    if (selectedRow.note != inputNote.val() && inputNote.val() != '') params.note = inputNote.val();
    return params;
}
window.operateEvents = {
    'click .download': function (e, value, row, index) {
        if (row.templateUrl) {
            window.open(row.templateUrl, "_blank");
        } else {
            notice("你还没上传实验报告模板呢！", 'error');
        }
    },
    'click .upload': function (e, value, row, index) {
        selectedReportId = row.reportId;
    },
    'click .update': function (e, value, row, index) {
        selectedReportId = row.reportId;
        selectedRow = row;
        initUpdateReportModel(row);
    },
    'click .score': function (e, value, row, index) {
        window.open("score_report.html?userId=" + userId + "&reportId=" + row.reportId, "_blank");
    },
    'click .delete': function (e, value, row, index) {
        selectedReportId = row.reportId;
    }
};
