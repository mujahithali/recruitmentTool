const urlHash = $(location).prop("hash");
const doRemoveGridBorder = (urlHash.indexOf("cbr=0") !== -1);
const doRemoveHeaderBGColor = (urlHash.indexOf("hbl=1") !== -1);
const doClearSession = (urlHash.indexOf("cs=1") !== -1);
const doPreventColumnDrag = (urlHash.indexOf("pcgd=1") !== -1);
const doPreventRejSelDrag = (urlHash.indexOf("prsd=1") !== -1);
const headerDataSessionKeyName = "rt_header_data";
const listDataSessionKeyName = "rt_list_data";
const fetchURL = "https://randomuser.me/api?results=4";
const columnObj = [
    { text: "Open", color: "#74744d" },
    { text: "Contacted", color: "#E1B52C" },
    { text: "Written Test", color: "#632289" },
    { text: "Technical Round", color: "#04BCDD" },
    { text: "Culture Fit Round", color: "#CD5C5C" },
    { text: "HR Final Round", color: "#8E9C9C" },
    { text: "Selected", color: "#2AC06D" },
    { text: "Rejected", color: "#FF0000" }
];
let columnGrids = [];
let boardGrid;

let doRegisterShortlistPageEvents = () => {
    $("body").off("keyup blur", "#id_searchCandidate").on({
        "keyup blur": function () {
            doSearchCandidate(this);
        }
    }, "#id_searchCandidate");
}

let checkAndGetCandidateList = () => {
    
    let candidateSessionData = getSessionData(listDataSessionKeyName);

    if (doClearSession || !candidateSessionData || typeof (candidateSessionData) == "undefined") {
        clearSessionData(listDataSessionKeyName);
        getCandidateList();
    }
    else if (candidateSessionData && typeof (candidateSessionData) != "undefined") {
        initShortlistedBoard(candidateSessionData);
    }
}

let getCandidateList = async () => {
    let candidateRespData;
    await fetch(fetchURL)
        .then(response => {
            candidateRespData = response
        })
        .catch(error => {
            console.log(error)
        });

    const candidateList = await candidateRespData.json();
    initShortlistedBoard(candidateList);

    if (typeof (isDebugMode) != "undefined" && isDebugMode) {
        console.log(candidateList);
    }
}

let initShortlistedBoard = (list) => {    
    if (list && "results" in list) {
        $(".rtShortListedCount").text(list["results"].length);

        if (list["results"].length) {
            initColumnGrid(list["results"]);
        }
    }
}

let initColumnGrid = (candidateList) => {
    $("#id_shortlistedBoard .board").html("");

    let columnSessionData = getSessionData(headerDataSessionKeyName);
    let columnArrObj = "";
    if (doClearSession || !columnSessionData || typeof (columnSessionData) == "undefined") {
        clearSessionData(headerDataSessionKeyName);
        columnArrObj = columnObj.map(a => { return a });
    }
    else if (columnSessionData && typeof (columnSessionData) != "undefined") {
        columnSessionData.sort((a, b) => a.translateX > b.translateX ? 1 : -1);
        columnArrObj = columnSessionData.map(a => { return a });
    }

    columnArrObj.map((column, _idx) => {
        let statusText = column.text.toLowerCase().replace(/\s+/g, '');
        let columnHtml = `
        <div class="board_column br1_ccc ${column.text.toLowerCase()}" id="id_board_column_${statusText}" rtStatus="${statusText}">
	        <div class="board_column_container">
		        <div class="board_column_header" style="background:${column.color};border-left:3px solid ${column.color};" rtStatus="${statusText}">
                    <span class="board_column_header_status">${column.text}</span><span class="board_column_header_count"></span>
                </div>
		        <div class="board_column_content_wrapper">
			        <div class="board_column_content ${statusText}"></div>
		        </div>
	        </div>
        </div>
        `;

        $("#id_shortlistedBoard .board").append(columnHtml);
    });

    getCardGridObj(candidateList);
}

let getCardGridObj = (candidateList) => {
    let candidateData = [];
    candidateList.forEach((candidate, idx) => {
        let rtStatusVal = "", rtFullnameVal = "", rtLocationVal = "";

        if (doClearSession) {
            rtStatusVal = "open";
        }
        else if ("rtStatus" in candidate) {
            rtStatusVal = candidate["rtStatus"];
        }
        else {
            rtStatusVal = (idx % 2 ? "open" : (idx % 3 ? "contacted" : "technicalround"));
        }

        if ("rtFullname" in candidate) {
            rtFullnameVal = candidate["rtFullname"];
        }
        else if ("name" in candidate) {
            rtFullnameVal = candidate["name"]["first"] + " " + candidate["name"]["last"];
        }

        if ("rtLocation" in candidate) {
            rtLocationVal = candidate["rtLocation"];
        }
        else if ("location" in candidate) {
            rtLocationVal = candidate["location"]["country"];
        }

        candidateData.push({
            "rtStatus": rtStatusVal,
            "rtFullname": rtFullnameVal,
            "rtLocation": rtLocationVal
        });
    });

    initCardGrid(candidateData);
}

let initCardGrid = (candidateList) => {
    candidateList.map(candidate => {
        let cardHtml = `
        <div class="board_item board-item">
            <div class="board_item_content">
                <div class="board_item_content_name">${candidate["rtFullname"]}</div>
                <div class="board_item_content_loc">${candidate["rtLocation"]}</div>
            </div>
        </div>
        `;

        $(`#id_shortlistedBoard .board_column_content.${candidate["rtStatus"]}`).append(cardHtml);
    });

    $(".rtShortlistedTopContainer").removeClass("hidden");
    initDraggable();
}

let initDraggable = () => {
    const dragContainerEl = document.querySelector('.drag_container');
    const itemContainersEl = [].slice.call(document.querySelectorAll('.board_column_content'));

    // Init column grid draggable
    itemContainersEl.forEach(function (container) {
        var grid = new Muuri(container, {
            items: '.board_item',
            dragEnabled: ((doPreventRejSelDrag && $(container).hasClass("selected")) ? false : true),
            dragSort: function () {
                return columnGrids;
            },
            dragContainer: dragContainerEl,
            dragAutoScroll: {
                targets: (item) => {
                    return [
                        { element: window, priority: 0 },
                        { element: item.getGrid().getElement().parentNode, priority: 1 },
                    ];
                }
            },
        })
        .on('dragInit', function (item) {
            item.getElement().style.width = item.getWidth() + 'px';
            item.getElement().style.height = item.getHeight() + 'px';
        })
        .on('dragReleaseEnd', function (item) {
            item.getElement().style.width = '';
            item.getElement().style.height = '';
            item.getGrid().refreshItems([item]);
            doUpdateSessionData();
            let statusText = $((item.getElement())).parents(".board_column").attr("rtStatus");
            let isSelectedOrRejectedColumn = (statusText == "selected" || statusText == "rejected");
            if (doPreventRejSelDrag && isSelectedOrRejectedColumn) {
                item.getGrid().destroy();
            }
        })
        .on('layoutStart', function () {
            boardGrid.refreshItems().layout();
        });
        columnGrids.push(grid);
    });

    boardGrid = new Muuri('.board', {
        dragEnabled: (doPreventColumnDrag ? false : true),
        dragHandle: '.board_column_header'
    })
    .on('dragReleaseEnd', function () {
        doUpdateSessionData();
    })
    .on('layoutStart', function () {
        gridLayoutInitCbk();        
    });
}

let gridLayoutInitCbk = () => {    
    doUpdateGridContainerWidth();
    doUpdateStyle();
    doUpdateSessionData();
}

let doRefreshGrid = () => {
    if (columnGrids && columnGrids.length) {
        columnGrids.forEach(columnGrid => columnGrid.refreshItems().layout());
    }
}

let doUpdateSessionData = () => {
    let headerDataArr = [];
    let listDataArr = [];
    let isLayoutRefreshed = false;

    $(".board_column_header").each((_idx, headerEl) => {
        let rtStatusText = $(headerEl).find(".board_column_header_status").text();
        let rtStatusColor = $(headerEl).cssColorAsHex("border-left-color");
        let rtStatus = $(headerEl).attr("rtStatus");
        let $cardEl = $(headerEl).parent().find("div.board_item");
        let cardCount = $cardEl.length;
        let translateXY = getTranslateXY(document.getElementById(($(headerEl).parents(".board_column").attr("id"))));
        let translateX = (translateXY ? translateXY.translateX : 0);

        $(headerEl).find(".board_column_header_count").text(" - " + cardCount);
        isLayoutRefreshed = (isLayoutRefreshed ? isLayoutRefreshed : translateX);

        headerDataArr.push({ "text": rtStatusText, "color": rtStatusColor, "translateX": (translateXY ? translateXY.translateX : 0)});

        $cardEl.map((_idx2, card) => {
            let candidateDataObj =
            {
                "rtStatus": rtStatus,
                "rtFullname": $(card).find(".board_item_content_name").text().trim(),
                "rtLocation": $(card).find(".board_item_content_loc").text().trim()
            };
            listDataArr.push(candidateDataObj);
        });
    });

    setSessionData(headerDataSessionKeyName, headerDataArr);
    setSessionData(listDataSessionKeyName, { "results": listDataArr });

    if (!isLayoutRefreshed && boardGrid) {
        boardGrid.refreshItems().layout();
    }
}

let doUpdateGridContainerWidth = () => {
    if (!layoutLoadedStateEx.isLayoutLoaded()) {
        layoutLoadedStateEx.layoutLoaded();
        $(".board").width($(".board_column").length * $(".board_column").outerWidth(true));
        doRefreshGrid();
    }
}

let doUpdateStyle = () => {
    if (doRemoveGridBorder)
        $(".board_column").removeClass("br1_ccc");
    if (doRemoveHeaderBGColor) 
        $(".board_column_header").addClass("bc_fff");
}

let doSearchCandidate = (el) => {
    let $cardItemEl = $(".board_item");
    let searchText = ($(el).val() ? $(el).val().trim().toLowerCase() : "");

    if (searchText) {
        $cardItemEl.hide();

        $cardItemEl.each(function () {
            let $candidateNameEl = $(this).find(".board_item_content_name");
            let candidateNameVal = ($candidateNameEl ? $candidateNameEl.text().trim() : "");

            if (candidateNameVal && candidateNameVal.trim().toLowerCase().indexOf(searchText) > -1) {
                $(this).show();
            }
        });
    }
    else {
        $cardItemEl.show();
    }

    doRefreshGrid();
}

let layoutLoadedState = () => {
    let isLayoutLoaded = false;

    let layoutLoadedEx = () => {
        isLayoutLoaded = true;
    };

    return {
        isLayoutLoaded: () => {
            return isLayoutLoaded;
        },
        layoutLoaded: () => {
            layoutLoadedEx();
        }
    };
}

let layoutLoadedStateEx = layoutLoadedState();

$(() => {
    checkAndGetCandidateList();

    doRegisterShortlistPageEvents();
})