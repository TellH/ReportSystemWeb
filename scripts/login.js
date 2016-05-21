/**
 * Created by tlh on 2016/5/8.
 */
var preUrl = 'http://localhost:8080/ReportSystem/';

$(document).ready(function () {
    $("#btn_login").click(function () {
        if (NProgress.isStarted()) {
            notice("我们在为您拼命加载中，请您耐心等待！Loading...", 'info');
            return;
        }
        if (!validateForm($("#form_login")[0])) {
            return;
        }
        NProgress.start();
        $.ajax({
            type: "POST",
            url: preUrl + "account/login.do",
            dataType: 'json',
            data: {
                userId: $("#login-id").val(),
                password: $("#login-pass").val(),
                identity: $("#select_identity").val()
            },
            success: function (data) {
                NProgress.done();
                if (data.result == "failed") {
                    notice(data.msg, 'error');
                } else if (data.result == "success") {
                    if (data.identity == 0)
                        window.location.href = "student_home.html?userId=" + $("#login-id").val() + "&identity=" + data.identity;
                    else
                        window.location.href = "teacher_home.html?userId=" + $("#login-id").val() + "&identity=" + data.identity;
                }
            },
            error: function (jqXHR) {
                NProgress.done();
                notice("似乎出现了些小问题,错误码：" + jqXHR.status, 'error');
            }
        })
    });
    $("#summit_password").click(function () {
        if (NProgress.isStarted()) {
            notice("我们在为您拼命加载中，请您耐心等待！Loading...", 'info');
            return;
        }
        if (!validateForm($("#form_update_password")[0])) {
            return;
        }
        NProgress.start();
        $.ajax({
            type: "POST",
            url: preUrl + "account/update.do",
            dataType: 'json',
            data: {
                userId: $("#login-id").val(),
                identity: $("#select_identity").val(),
                oldPassword: $("#oldPassword").val(),
                newPassword: $("#newPassword").val()
            },
            success: function (data) {
                NProgress.done();
                if (data.result == "failed") {
                    notice(data.msg, 'error');
                } else if (data.result == "success") {
                    notice(data.msg, 'success');
                }
                $('#updatePasswordModal').modal('toggle');
            },
            error: function (jqXHR) {
                NProgress.done();
                notice("似乎出现了些小问题,无法提交修改", 'error');
            }
        })
    });
});