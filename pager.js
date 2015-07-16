/**
 * Created by cmmchang on 2015/7/14.
 */
define(function(require,exports,module){
    /**
     * @type Pager
     * @namespace
     */
    var Pager = function() {
        this.eleContainer = null;     // 分页容器
        this.alwayShow = false;      // 页数为0时是否隐藏
        this.totalPage = 0;         // 总页数
        this.pageSize = Pager.Const.PG_DEF_PAGESIZE; // 分页大小
        this.previousPage = 0;     //记录前一个页数
        this.currentPage = 0;      //当前页数
        this.offsetPage = Pager.Const.PG_DEF_OFFSETSIZE; // 偏移分页显示数
        this.staus = Pager.Const.PG_STATUS_READY; //分页状态
        this.initialized = false; // 是否初始化
        this.onTurnPage = function(page, pagesize) {
            return true;
        };
        this.totalCnt = 0;
        this.id = Pager.maxId; //分页组件的id
        this.hideEmpty = true;
        this.Templet = {
            CONTENT : '<form method="get" action="##" id="pager_form_{id}">{begin}<p class="mod_pagenav_main">{previous}<span class="mod_pagenav_count">{first}{prevdot}{pager}{nextdot}{last}</span>{pagecount}{summary}{next}</p><p class="mod_pagenav_option"><span class="mod_pagenav_turn">{goinput}{gobutton}</span></p></form>',

            FIRST_DISABLE : '',
            FIRST_ENABLE : '<a href="##" class="pager_item_{id}" id="pager_num_{id}_1" title="1"><span>1</span></a>\n',

            LAST_DISABLE : '',
            LAST_ENABLE : '<a href="##" class="pager_item_{id}" id="pager_last_{id}" title="{totpage}"><span>{totpage}</span></a>\n',

            PREVIOUS_DISABLE : '<a class="mod_pagenav_disable"><span>上一页</span></a>\n',
            PREVIOUS_ENABLE : '<a href="##" id="pager_previous_{id}" title="上一页"><span>上一页</span></a>\n',

            NEXT_DISABLE : '<a class="mod_pagenav_disable"><span>下一页</span></a>\n',
            NEXT_ENABLE : '<a href="##" title="下一页" id="pager_next_{id}"><span>下一页</span></a>\n',

            PAGE_NORMAL : '<a href="##" class="pager_item_{id}" id="pager_num_{id}_{pagenum}" title="{pagenum}"><span>{pagenum}</span></a>\n',
            PAGE_CURRENT : '<a class="current"><span>{pagenum}</span></a>\n',

            GO_PAGE_INPUT : '', //直接跳转时的输入框
            GO_PAGE_BUTTON : '', //直接跳转时的选择按钮

            PAGE_COUNT : '<a class="mod_pagenav_count2"><span>{curpg}</span>/{totpage}</a>\n',  // 总页数与当前页数

            PREVDOT_ENABLE : '<a class="mod_pagenav_more"><span>...</span></a>\n',//后面的省略号
            PREVDOT_DISABLE : "",

            NEXTDOT_ENABLE : '<a class="mod_pagenav_more"><span>...</span></a>\n',  //前面的省略号
            NEXTDOT_DISABLE : "",

            SUMMARY : "",
            BEGIN : ""
        };

        Pager.items[Pager.maxId] = this;
        Pager.maxId++;
    };

    Pager.Const = {
        PG_STATUS_READY : 0, // 分页准备完毕
        PG_STATUS_GO : 1, // 分页中
        PG_DEF_OFFSETSIZE : 5, // 默认偏移分页显示数
        PG_DEF_PAGESIZE : 10
        // 默认分页大小
    };

    Pager.maxId = 0;
    Pager.items = {};

    /**
     * 初始化分页器
     *
     * @param {HTMLElement}
     *          eleContainer 分页显示容器
     * @param {int}
     *          totalPage 总页数
     */
    Pager.prototype.init = function(eleContainer, totalPage) {
        if (!eleContainer || !totalPage)
            return;
        this.eleContainer = eleContainer;
        this.totalPage    = totalPage;
        this.initialized  = true;
    };

    /**
     * 填充分页HTML代码
     */
    Pager.prototype.fillPager = function() {
        if (!this.initialized || !this.currentPage || !this.eleContainer)
            return;
        var pageArr = [];
        var pageHTML = '';
        var start, end, i;
        this.currentPage = parseInt(this.currentPage, 10);
        this.offsetPage = parseInt(this.offsetPage,10);
        // 生成分页HTML
        start = (this.currentPage - this.offsetPage > 0) ? (this.currentPage - this.offsetPage) : 1;
        end = (this.currentPage + this.offsetPage <= this.totalPage) ? (this.currentPage + this.offsetPage) : this.totalPage;

        var leftoffset, rightoffset;

        leftoffset = this.currentPage - start;
        leftoffset = leftoffset > 0 ? leftoffset : 0;

        rightoffset = end - this.currentPage;
        rightoffset = rightoffset > 0 ? rightoffset : 0;

        if (leftoffset + rightoffset < this.offsetPage * 2) {
            m = Math.abs(leftoffset - rightoffset);
            if (leftoffset < rightoffset) {
                end = end + m;
            }
            else {
                start = start - m;
            }
        }
        if (end > this.totalPage)
            end = this.totalPage;
        if (start < 1)
            start = 1;
        if (start - 1 >= 2 && this.currentPage - start >= 2) {
            start++;
        }

        // 修复了结尾类似[10][11][12][...][14]的问题，不容易啊
        if (end + 2 == this.totalPage) {
            end++;
        }

        for (i = start; i <= end && i <= this.totalPage; i++) {
            if (i == 1 && this.currentPage != 1)
                continue;
            if (i == this.totalPage && this.currentPage != this.totalPage)
                continue;
            if (i == this.currentPage) {
                pageArr.push(this.Templet.PAGE_CURRENT.replace(/\{pagenum\}/g, i));
            }
            else {
                pageArr.push(this.Templet.PAGE_NORMAL.replace(/\{pagenum\}/g, i));
            }
        }
        
        // 补全分页信息
        pageHTML = this.Templet.CONTENT.replace(/\{pager\}/g, pageArr.join(''));
        pageHTML = pageHTML.replace(/\{prevdot\}/g, start - 1 > 1 ? this.Templet.PREVDOT_ENABLE : this.Templet.PREVDOT_DISABLE);
        pageHTML = pageHTML.replace(/\{nextdot\}/g, this.totalPage - end > 1 ? this.Templet.NEXTDOT_ENABLE : this.Templet.NEXTDOT_DISABLE);
        pageHTML = pageHTML.replace(/\{first\}/g, (this.currentPage == 1) ? this.Templet.FIRST_DISABLE : this.Templet.FIRST_ENABLE);
        pageHTML = pageHTML.replace(/\{previous\}/g, (this.currentPage == 1) ? this.Templet.PREVIOUS_DISABLE : this.Templet.PREVIOUS_ENABLE);
        pageHTML = pageHTML.replace(/\{next\}/g, (this.currentPage == this.totalPage) ? this.Templet.NEXT_DISABLE : this.Templet.NEXT_ENABLE);
        pageHTML = pageHTML.replace(/\{last\}/g, (this.currentPage == this.totalPage) ? this.Templet.LAST_DISABLE : this.Templet.LAST_ENABLE);
        pageHTML = pageHTML.replace(/\{goinput\}/g, this.Templet.GO_PAGE_INPUT);
        pageHTML = pageHTML.replace(/\{gobutton\}/g, this.Templet.GO_PAGE_BUTTON);
        pageHTML = pageHTML.replace(/\{summary\}/g, this.Templet.SUMMARY);
        pageHTML = pageHTML.replace(/\{pagecount\}/g, this.Templet.PAGE_COUNT);
        pageHTML = pageHTML.replace(/\{id\}/g, this.id);
        pageHTML = pageHTML.replace(/\{begin\}/g, this.Templet.BEGIN);
        pageHTML = pageHTML.replace(/\{totpage\}/g, this.totalPage);
        pageHTML = pageHTML.replace(/\{curpg\}/g, this.currentPage);
        pageHTML = pageHTML.replace(/\{pagenum\}/g, this.currentPage);
        pageHTML = pageHTML.replace(/\{totalcnt\}/g, this.totalCnt);

        // 填充到分页容器
        if (this.totalPage <= 1 && this.alwayShow == false) {
            this.eleContainer.style.display = (this.hideEmpty ? 'none' : '');
        } else {
            this.eleContainer.style.display = '';
        }
        this.eleContainer.innerHTML = pageHTML;
    };

    /**
     *  跳转到具体某一页
     *  @param {int}
     */
    Pager.prototype.goPage = function(page) {
        page = parseInt(page, 10);
        if (isNaN(page))
            page = 1;
        if (page < 1) {
            page = 1;
        }
        else if (page > this.totalPage) {
            page = this.totalPage;
        }
        this.previousPage = this.currentPage;
        this.currentPage = page;
        Live.event.preventDefault();

        if (typeof this.onTurnPage == 'function') {// 执行翻页
            if (!this.onTurnPage(this.currentPage, this.pageSize)) {
                return false;
            }
        }
        this.fillPager(); // 填充分页
        return false;
    };

    Pager.prototype.refresh = function() {
        this.goPage(this.currentPage);
    };

    module.exports = Pager;

})
