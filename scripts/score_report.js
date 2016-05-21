/**
 * Created by tlh on 2016/5/21.
 */
var preUrl = 'http://localhost:8080/ReportSystem/';
var userId;
var reportId;
var selectedStudentId;
var students;
var table;
function handleStudentsData() {
    for (var i = 0; i < students.length; i++) {
        if (students[i].location == 0) {
            students[i].location = "余区";
        } else {
            students[i].location = "马区";
        }
        if (students[i].sex == 0) {
            students[i].sex = "男";
        } else {
            students[i].sex = "女";
        }
        if (students[i].status == '0') {
            students[i].status = '未提交';
        } else if (students[i].status == '1') {
            students[i].status = '已提交';
        } else {
            students[i].status = '已批改';
        }
    }
}
$(document).ready(function () {
    userId = $.getUrlParam('userId');
    reportId = $.getUrlParam('reportId');
    // userId = 3914;
    // reportId = 5401115;
    table = $("#table");
    // load report detail
    NProgress.start();
    $.ajax({
        type: "POST",
        url: preUrl + "report/teacher/detail.do",
        dataType: 'json',
        data: {
            userId: userId/*3914*/,
            reportId: reportId/*5401115*/
        },
        success: function (data) {
            NProgress.done();
            if (data.result == "failed") {
                notice(data.msg, 'error');
            } else if (data.result == "success") {
                students = data.data[0].students;
                handleStudentsData();
                $("#pin_report_title").text('题目：' + data.data[0].name);
                var reportDesc = $("#report_desc")[0];
                var reportLesson = '课程：' + data.data[0].lesson.name + ' ' + data.data[0].lesson.grade;
                var lessonNode = document.createElement('p');
                lessonNode.appendChild(document.createTextNode(reportLesson));
                reportDesc.appendChild(lessonNode);

                var reportContent = '内容：' + data.data[0].content;
                var contentNode = document.createElement('p');
                contentNode.appendChild(document.createTextNode(reportContent));
                reportDesc.appendChild(contentNode);
                initTable();
            }
        },
        error: function (jqXHR) {
            NProgress.done();
            notice("似乎出现了些小问题,错误码：" + jqXHR.status, 'error');
        }
    });
    $("#summit_score").click(function () {
        if (NProgress.isStarted()) {
            notice("我们在为您拼命加载中，请您耐心等待！Loading...", 'info');
            return;
        }
        NProgress.start();
        var params = {
            userId: userId,
            reportId: reportId,
            studentId: selectedStudentId
        };
        if ($("#comment").val() != '')
            params.comment = $("#comment").val();
        if ($("#score").val() != '')
            params.score = $("#score").val();
        $.ajax({
            type: "POST",
            url: preUrl + "report/teacher/updatePerStudent.do",
            dataType: 'json',
            data: params,
            success: function (data) {
                NProgress.done();
                if (data.result == "success") {
                    notice(data.msg, 'success');
                    table.bootstrapTable('refresh', {
                        url: preUrl + "report/teacher/detail.do",
                        query: {
                            userId: userId,
                            reportId: reportId
                        }
                    });
                    $("#scoreReportModal").hide();
                } else {
                    notice(data.msg, 'error');
                }
            },
            error: function (jqXHR) {
                NProgress.done();
                notice("似乎出现了些小问题,更新失败，请稍后再试~", 'error');
            }
        });
        NProgress.start();
    });
});
function initTable() {
    $("#table").bootstrapTable({
        columns: [{
            title: '学号',
            field: 'id',
            align: 'center',
            valign: 'middle'
        }, {
            title: '姓名',
            field: 'name',
            align: 'center',
            valign: 'middle'
        }, {
            title: '学院',
            field: 'college',
            align: 'center',
            valign: 'middle'
        }, {
            title: '专业',
            field: 'major',
            align: 'center',
            valign: 'middle'
        }, {
            title: '状态',
            field: 'status',
            align: 'center',
            valign: 'middle'
        }, {
            title: '分数',
            field: 'score',
            align: 'center',
            valign: 'middle'
        }, {
            title: '年级',
            field: 'grade',
            align: 'center',
            valign: 'middle'
        }, {
            title: '操作',
            align: 'center',
            valign: 'middle',
            events: operateEvents,
            formatter: operateFormatter
        }],
        toolbar: "#toolbar",
        search: "true",
        showRefresh: "true",
        showToggle: "true",
        showColumns: "true",
        showExport: "true",
        detailView: "true",
        detailFormatter: "detailFormatter",
        data: students,
        responseHandler: responseHandler
    });

}
function operateFormatter(value, row, index) {
    return [
        '<a class="download" href="javascript:void(0)" title="下载学生提交的报告">',
        '<i class="glyphicon glyphicon-download-alt"></i>',
        '</a>&nbsp;',
        '<a class="score" href="javascript:void(0)" target="_blank" title="批改实验报告" data-toggle="modal" data-target="#scoreReportModal">',
        '<i class="material-icons">spellcheck</i>',
        '</a>&nbsp;'
    ].join('');
}
function initScoreReportModel(row) {
    var score = $("#score");
    var comment = $("#comment");
    score.val('');
    comment.val('');
    if (row.score) {
        score.val(row.score);
    }
    if (row.comment) {
        comment.val(row.comment);
    }
}
window.operateEvents = {
    'click .download': function (e, value, row, index) {
        if (row.docUrl) {
            window.open(row.docUrl, "_blank");
        } else {
            notice("该学生还未提交实验报告！", 'error');
        }
    },
    'click .score': function (e, value, row, index) {
        selectedStudentId = row.id;
        initScoreReportModel(row);
    }
};
function detailFormatter(index, row) {
    var html = [];
    html.push('<ul>');
    var row = students[index];
    $.each(row, function (key, value) {
        switch (key) {
            case 'comment':
                html.push('<li><b>' + '老师评语' + ':</b> ' + value + '</li>');
                break;
            case 'advice':
                html.push('<li><b>' + '学生反馈' + ':</b> ' + value + '</li>');
                break;
            case 'sex':
                html.push('<li><b>' + '性别' + ':</b> ' + value + '</li>');
                break;
            case 'location':
                html.push('<li><b>' + '所在校区' + ':</b> ' + value + '</li>');
                break;
            case 'enterTime':
                html.push('<li><b>' + '入学时间' + ':</b> ' + value + '</li>');
                break;
            default:
                break;
        }
    });
    html.push('</ul>');
    return html.join('');
}
function responseHandler(sourceData) {
    NProgress.done();
    if (sourceData.result == "success") {
        students = sourceData.data[0];
        handleStudentsData();
        return {
            "rows": students
        }
    } else {
        return {
            "rows": []
        }
    }
}
