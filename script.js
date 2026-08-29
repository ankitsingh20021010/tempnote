const pagesList = document.getElementById("pagesList");

const newPageBtn = document.getElementById("newPageBtn");
const downloadBtn = document.getElementById("downloadBtn");
const clearBtn = document.getElementById("clearBtn");

const pageTitle = document.getElementById("pageTitle");
const pageMeta = document.getElementById("pageMeta");

const noteEditor = document.getElementById("noteEditor");

const headingBtn = document.getElementById("headingBtn");
const duplicateBtn = document.getElementById("duplicateBtn");
const deletePageBtn = document.getElementById("deletePageBtn");

const linedBtn = document.getElementById("linedBtn");
const plainBtn = document.getElementById("plainBtn");

const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");

const paper = document.getElementById("paper");

const menuBtn = document.getElementById("menuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const clearModal = document.getElementById("clearModal");
const cancelClearBtn = document.getElementById("cancelClearBtn");
const confirmClearBtn = document.getElementById("confirmClearBtn");


let pages = [];
let activePageId = null;
let paperStyle = "lined";


function createPageId() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8)
    );
}


function createPage(
    title = "Untitled Page",
    content = ""
) {
    return {
        id: createPageId(),
        title,
        content,
        createdAt: new Date()
    };
}


function initializeApp() {

    const firstPage = createPage();

    pages.push(firstPage);

    activePageId = firstPage.id;

    renderPages();

    loadActivePage();

    updatePaperStyle();
}


function getActivePage() {

    return pages.find(
        page => page.id === activePageId
    );
}


function renderPages() {

    pagesList.innerHTML = "";

    pages.forEach(page => {

        const pageButton =
            document.createElement("button");

        pageButton.type = "button";

        pageButton.className =
            "page-item";


        if (page.id === activePageId) {

            pageButton.classList.add(
                "active"
            );
        }


        const icon =
            document.createElement("span");

        icon.className =
            "page-item-icon";

        icon.textContent =
            "▤";


        const content =
            document.createElement("span");

        content.className =
            "page-item-content";


        const title =
            document.createElement("span");

        title.className =
            "page-item-title";

        title.textContent =
            page.title.trim() ||
            "Untitled Page";


        const preview =
            document.createElement("span");

        preview.className =
            "page-item-preview";


        const previewText =
            htmlToPlainText(
                page.content
            )
            .replace(/\s+/g, " ")
            .trim();


        preview.textContent =
            previewText ||
            "Empty page";


        content.appendChild(title);

        content.appendChild(preview);

        pageButton.appendChild(icon);

        pageButton.appendChild(content);


        pageButton.addEventListener(
            "click",
            () => {

                saveCurrentPage();

                activePageId =
                    page.id;

                loadActivePage();

                renderPages();

                closeMobileSidebar();
            }
        );


        pagesList.appendChild(
            pageButton
        );

    });


    updatePageMeta();
}


function loadActivePage() {

    const page =
        getActivePage();

    if (!page) return;


    pageTitle.value =
        page.title ||
        "Untitled Page";


    noteEditor.innerHTML =
        page.content || "";


    updatePageMeta();

    updateCounters();

    updateHeadingButtonState();
}


function saveCurrentPage() {

    const page =
        getActivePage();

    if (!page) return;


    page.title =
        pageTitle.value.trim() ||
        "Untitled Page";


    page.content =
        noteEditor.innerHTML;
}


function createNewPage() {

    saveCurrentPage();


    const newPage =
        createPage();


    pages.push(newPage);

    activePageId =
        newPage.id;


    renderPages();

    loadActivePage();

    closeMobileSidebar();


    setTimeout(
        () => {
            noteEditor.focus();
        },
        50
    );
}


function deleteActivePage() {

    if (pages.length === 1) {

        const page =
            getActivePage();

        if (!page) return;


        page.title =
            "Untitled Page";

        page.content =
            "";


        loadActivePage();

        renderPages();

        noteEditor.focus();

        return;
    }


    const currentIndex =
        pages.findIndex(
            page =>
                page.id === activePageId
        );


    pages =
        pages.filter(
            page =>
                page.id !== activePageId
        );


    const nextIndex =
        Math.max(
            0,
            currentIndex - 1
        );


    activePageId =
        pages[nextIndex].id;


    loadActivePage();

    renderPages();
}


function duplicateActivePage() {

    saveCurrentPage();


    const currentPage =
        getActivePage();

    if (!currentPage) return;


    const duplicate =
        createPage(
            `${currentPage.title || "Untitled Page"} Copy`,
            currentPage.content
        );


    const currentIndex =
        pages.findIndex(
            page =>
                page.id === activePageId
        );


    pages.splice(
        currentIndex + 1,
        0,
        duplicate
    );


    activePageId =
        duplicate.id;


    renderPages();

    loadActivePage();

    closeMobileSidebar();
}


pageTitle.addEventListener(
    "input",
    () => {

        const page =
            getActivePage();

        if (!page) return;


        page.title =
            pageTitle.value.trim() ||
            "Untitled Page";


        renderPages();
    }
);


noteEditor.addEventListener(
    "input",
    () => {

        const page =
            getActivePage();

        if (!page) return;


        page.content =
            noteEditor.innerHTML;


        updateCounters();

        renderPages();

        updateHeadingButtonState();
    }
);


function getEditorText() {

    return noteEditor.innerText
        .replace(/\u00a0/g, " ");
}


function updateCounters() {

    const raw =
        getEditorText();


    const text =
        raw.trim();


    const characters =
        raw.length;


    const words =
        text.length === 0
            ? 0
            : text.split(/\s+/).length;


    wordCount.textContent =
        `${words} ${
            words === 1
                ? "word"
                : "words"
        }`;


    charCount.textContent =
        `${characters} ${
            characters === 1
                ? "character"
                : "characters"
        }`;
}


function updatePageMeta() {

    const index =
        pages.findIndex(
            page =>
                page.id === activePageId
        );


    if (index === -1) return;


    pageMeta.textContent =
        `Page ${index + 1} of ${pages.length}`;
}


function getCurrentBlock() {

    const selection =
        window.getSelection();


    if (
        !selection ||
        selection.rangeCount === 0
    ) {
        return null;
    }


    let node =
        selection.anchorNode;


    if (
        node &&
        node.nodeType === Node.TEXT_NODE
    ) {
        node =
            node.parentElement;
    }


    if (
        !(node instanceof Element)
    ) {
        return null;
    }


    const block =
        node.closest(
            "div, p, li"
        );


    if (
        block &&
        noteEditor.contains(block)
    ) {
        return block;
    }


    return null;
}


function placeCaretAtEnd(element) {

    const range =
        document.createRange();


    range.selectNodeContents(
        element
    );


    range.collapse(false);


    const selection =
        window.getSelection();


    selection.removeAllRanges();

    selection.addRange(range);
}


function createHeadingLine() {

    const heading =
        document.createElement("div");


    heading.className =
        "note-heading";


    heading.innerHTML =
        "<br>";


    noteEditor.appendChild(
        heading
    );


    placeCaretAtEnd(
        heading
    );


    saveCurrentPage();

    updateCounters();

    renderPages();

    updateHeadingButtonState();
}


function makeHeading() {

    const block =
        getCurrentBlock();


    if (!block) {

        createHeadingLine();

        return;
    }


    if (
        block === noteEditor
    ) {

        createHeadingLine();

        return;
    }


    block.classList.toggle(
        "note-heading"
    );


    saveCurrentPage();

    updateCounters();

    renderPages();

    updateHeadingButtonState();
}


function updateHeadingButtonState() {

    const block =
        getCurrentBlock();


    if (
        block &&
        block.classList.contains(
            "note-heading"
        )
    ) {

        headingBtn.classList.add(
            "active"
        );

    } else {

        headingBtn.classList.remove(
            "active"
        );
    }
}


headingBtn.addEventListener(
    "mousedown",
    event => {

        event.preventDefault();
    }
);


headingBtn.addEventListener(
    "click",
    () => {

        makeHeading();
    }
);


noteEditor.addEventListener(
    "keyup",
    updateHeadingButtonState
);


noteEditor.addEventListener(
    "mouseup",
    updateHeadingButtonState
);


document.addEventListener(
    "selectionchange",
    () => {

        if (
            noteEditor.contains(
                document.activeElement
            ) ||
            document.activeElement ===
                noteEditor
        ) {

            updateHeadingButtonState();
        }
    }
);


function updatePaperStyle() {

    if (
        paperStyle === "lined"
    ) {

        paper.classList.add(
            "lined-paper"
        );

        paper.classList.remove(
            "plain-paper"
        );


        linedBtn.classList.add(
            "active"
        );

        plainBtn.classList.remove(
            "active"
        );

    } else {

        paper.classList.remove(
            "lined-paper"
        );

        paper.classList.add(
            "plain-paper"
        );


        plainBtn.classList.add(
            "active"
        );

        linedBtn.classList.remove(
            "active"
        );
    }
}


linedBtn.addEventListener(
    "click",
    () => {

        paperStyle =
            "lined";

        updatePaperStyle();
    }
);


plainBtn.addEventListener(
    "click",
    () => {

        paperStyle =
            "plain";

        updatePaperStyle();
    }
);


function htmlToPlainText(html) {

    const temp =
        document.createElement("div");


    temp.innerHTML =
        html || "";


    return temp.innerText
        .replace(/\u00a0/g, " ")
        .trim();
}


function sanitizeFilename(filename) {

    return filename
        .replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            ""
        )
        .trim()
        .substring(0, 80)
        || "tempnote";
}


function downloadText(
    filename,
    text
) {

    const blob =
        new Blob(
            [text],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href =
        url;

    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );
}


function downloadCurrentPage() {

    saveCurrentPage();


    const page =
        getActivePage();


    if (!page) return;


    const title =
        page.title.trim() ||
        "Untitled Page";


    const content =
        htmlToPlainText(
            page.content
        );


    const fileContent =
`${title}

${content}

────────────────────────────
Created with TempNote
https://tempnote.in
`;


    downloadText(
        `${sanitizeFilename(title)}.txt`,
        fileContent
    );
}


function downloadAllPages() {

    saveCurrentPage();


    if (
        pages.length === 0
    ) {
        return;
    }


    let completeText =
`TempNote
Temporary Notes Export
https://tempnote.in

`;


    pages.forEach(
        (page, index) => {

            completeText +=
`========================================
Page ${index + 1}: ${
    page.title || "Untitled Page"
}
========================================

${
    htmlToPlainText(
        page.content || ""
    )
}

`;

        }
    );


    completeText +=
`========================================
Generated by TempNote
========================================`;


    downloadText(
        "tempnote-all-pages.txt",
        completeText
    );
}


downloadBtn.addEventListener(
    "click",
    () => {

        if (
            pages.length > 1
        ) {

            downloadAllPages();

        } else {

            downloadCurrentPage();
        }
    }
);


newPageBtn.addEventListener(
    "click",
    () => {

        createNewPage();
    }
);


duplicateBtn.addEventListener(
    "click",
    () => {

        duplicateActivePage();
    }
);


deletePageBtn.addEventListener(
    "click",
    () => {

        deleteActivePage();
    }
);


clearBtn.addEventListener(
    "click",
    () => {

        clearModal.classList.remove(
            "hidden"
        );
    }
);


cancelClearBtn.addEventListener(
    "click",
    () => {

        clearModal.classList.add(
            "hidden"
        );
    }
);


confirmClearBtn.addEventListener(
    "click",
    () => {

        pages = [];


        const firstPage =
            createPage();


        pages.push(
            firstPage
        );


        activePageId =
            firstPage.id;


        clearModal.classList.add(
            "hidden"
        );


        renderPages();

        loadActivePage();

        closeMobileSidebar();
    }
);


clearModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            clearModal
        ) {

            clearModal.classList.add(
                "hidden"
            );
        }
    }
);


function openMobileSidebar() {

    sidebar.classList.add(
        "open"
    );


    sidebarOverlay.classList.add(
        "show"
    );
}


function closeMobileSidebar() {

    sidebar.classList.remove(
        "open"
    );


    sidebarOverlay.classList.remove(
        "show"
    );
}


menuBtn.addEventListener(
    "click",
    openMobileSidebar
);


closeMenuBtn.addEventListener(
    "click",
    closeMobileSidebar
);


sidebarOverlay.addEventListener(
    "click",
    closeMobileSidebar
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeMobileSidebar();

            clearModal.classList.add(
                "hidden"
            );
        }
    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            (event.ctrlKey ||
             event.metaKey) &&
            event.key.toLowerCase() === "n"
        ) {

            event.preventDefault();

            createNewPage();
        }
    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            (event.ctrlKey ||
             event.metaKey) &&
            event.key.toLowerCase() === "s"
        ) {

            event.preventDefault();


            if (
                pages.length > 1
            ) {

                downloadAllPages();

            } else {

                downloadCurrentPage();
            }
        }
    }
);


initializeApp();
