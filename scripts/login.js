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
function resetFields(whichForm) {
    //遍历表单的所有元素
    for (var i = 0; i < whichForm.elements.length; i++) {
        var element = whichForm.elements[i];
        //如果该元素是一个提交按钮，跳转到下一次循环开始
        if (element.type == "submit") continue;
        //如果该元素没有默认值，跳转到下一次循环开始
        if (!element.defaultValue) continue;
        //为该元素获得输入焦点时增加一个响应处理函数，如果是默认值则把值置为空
        element.onfocus = function () {
            if (this.value == this.defaultValue) {
                this.value = "";
            }
        }
        //为该元素失去输入焦点时增加一个事件处理函数，如果值如果为空，把值置为默认值。
        element.onblur = function () {
            if (this.value == "") {
                this.value = this.defaultValue;
            }
        }
    }
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