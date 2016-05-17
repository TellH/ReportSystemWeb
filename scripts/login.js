/**
 * Created by tlh on 2016/5/8.
 */
var preUrl='http://localhost:8080/ReportSystem/';

$(document).ready(function () {
    $("#btn_login").click(function () {
        if (!validateForm($("#form_login")[0])) {
            return;
        }
        NProgress.start();
        $.ajax({
            type: "POST",
            url: preUrl+"account/login.do",
            dataType: 'json',
            data: {
                userId: $("#login-id").val(),
                password: $("#login-pass").val(),
                identity: $("#select_identity").val()
            },
            success: function (data) {
                NProgress.done();
                if (data.result == "failed") {
                    alert(data.msg);
                } else if (data.result == "success") {
                    alert(data.msg);
                    window.location.href = "student_home.html?userId=" + $("#login-id").val() + "&identity=" + data.identity;
                }
            },
            error: function (jqXHR) {
                NProgress.done();
                alert("似乎出现了些小问题,错误码：" + jqXHR.status);
            }
        })
    });
    $("#summit_password").click(function () {
        if (!validateForm($("#form_send_advice")[0])) {
            return;
        }
        NProgress.start();
        $.ajax({
            type: "POST",
            url: preUrl + "account/update.do",
            dataType: 'json',
            data: {
                userId: $("#login-id").val(),
                identity:$("#select_identity").val(),
                oldPassword: $("#oldPassword").val(),
                newPassword: $("#newPassword").val()
            },
            success: function (data) {
                NProgress.done();
                if (data.result == "failed") {
                    alert(data.msg);
                } else if (data.result == "success") {
                    alert(data.msg);
                }
                $('#updatePasswordModal').modal('toggle');
            },
            error: function (jqXHR) {
                NProgress.done();
                alert("似乎出现了些小问题,无法提交修改");
            }
        })
    });
});