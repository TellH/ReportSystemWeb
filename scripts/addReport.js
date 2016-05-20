/**
 * Created by tlh on 2016/5/16.
 */
var preUrl = 'http://localhost:8080/ReportSystem/';
var uploader;
var templateUrl;
function summitToAddReport() {
    if (NProgress.isStarted()){
        notice("我们在为您拼命加载中，请您耐心等待！Loading...",'success');
        return;
    }
    NProgress.start();
    var params = {
        userId: $.getUrlParam('userId'),
        password: $("#inputPassword").val(),
        reportName: $("#inputReportTitle").val(),
        content: $("#content").val(),
        location: parseInt($('input:radio:checked').val()),
        lessonId: $('select#selectLesson option:selected').val()
    };
    if (templateUrl) params.templateUrl = templateUrl;
    var inputCollege = $("#college");
    if (inputCollege[0].defaultValue != inputCollege.val() && inputCollege.val() != '') params.college = inputCollege.val();
    var inputMajor = $("#major");
    if (inputMajor[0].defaultValue != inputMajor.val() && inputMajor.val() != '') params.major = inputMajor.val();
    var timepicker = $("#deadline");
    if (timepicker[0].defaultValue != timepicker.val() && timepicker.val() != '') params.deadline = timepicker.val();
    var inputNote = $("#note");
    if (inputNote[0].defaultValue != inputNote.val() && inputNote.val() != '') params.note = inputNote.val();
    $.ajax({
        type: "POST",
        url: preUrl + "report/teacher/add.do",
        dataType: 'json',
        data: params,
        success: function (data) {
            NProgress.done();
            if (data.result == 'success') {
                notice("发布成功！",'success');
            } else {
                notice(data.msg,'error');
            }
        },
        error: function (jqXHR) {
            NProgress.done();
            notice("似乎出现了些小问题,实验报告没布置成功",'error');
        }
    })
}
function initLessonSelecter() {
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
            userId: $.getUrlParam('userId'),
            term: thisTerm
        },
        success: function (data) {
            if (data.result == "success") {
                var selectLesson = $("#selectLesson")[0];
                var lessons = data.data;
                for (var i = 0; i < lessons.length; i++) {
                    var lesson = lessons[i];
                    var lesssonOpt = document.createElement('option');
                    var lesssonOptTxt = document.createTextNode(lesson.name + ' ' + lesson.grade);
                    lesssonOpt.appendChild(lesssonOptTxt);
                    lesssonOpt.setAttribute('value', lesson.id);
                    selectLesson.appendChild(lesssonOpt);
                }
            }
        }
    });
}
$(document).ready(function () {
    initUploader();
    initLessonSelecter();
    $("#btn_add_report").click(function () {
        if (!validateForm($("#form_add_report")[0])) {
            return;
        }
        if (uploader.files.length >= 1) {
            NProgress.start();
            uploader.start();
        }else {
            summitToAddReport();
        }
    });
    $('#deadline').datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true
    });
});
function initUploader() {
    uploader = Qiniu.uploader({
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
                var pickfiles = $("#pickfiles")[0];
                pickfiles.value = file.name;
            },
            'UploadProgress': function (up, file) {
                // 每个文件上传时,处理相关的事情
                if (file.percent != 100)
                    NProgress.set(file.percent * 0.01);
            },
            'FileUploaded': function (up, file, info) {
                NProgress.done();
                var domain = up.getOption('domain');
                var res = eval('(' + info + ')');
                templateUrl = 'http://' + domain + '/' + res.key; //获取上传成功后的文件的Url
                summitToAddReport();
            },
            'Error': function (up, err, errTip) {
                //上传出错时,处理相关的事情
                NProgress.done();
                notice('上传实验模板出错，请检查网络设置并重新提交表单！','error');
            }
        }
    });
    uploader.bind('FilesAdded', function (uploader, file) {
        //确保每次选择文件只能添加一个文件，删掉前面添加的文件
        if (uploader.files.length > 1) {
            uploader.splice(0, 1);
        }
        var file = uploader.files[0];
        file.name = $.getUrlParam('userId') + new Date().getTime() + file.name;
    });
}
