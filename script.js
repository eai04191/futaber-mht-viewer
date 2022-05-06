function setError(message, ...args) {
    console.error(message, args);
    alert(message);
}

document.querySelector("#file").addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text().then((text) => text.replace(/\r\n/g, "\n"));
    const boundary = text.match(/\tboundary="(.+)";/)[1];
    if (!boundary) {
        setError("No boundary found");
        return;
    }

    const parts = text.split(`--${boundary}`);
    const processedParts = parts.map((part, index) => {
        if (index === 0) return;

        const trimedPart = part.trim();
        const splittedPart = trimedPart.split("\n\n");

        const headers = splittedPart[0];
        const body = splittedPart[1];

        if (!body) return;

        return {
            headers,
            body,
        };
    });

    document.querySelector("#result").innerHTML = "";
    processedParts.forEach((part) => {
        if (!part) return;

        if (part.headers.includes("Content-Type: text/html")) {
            const element = document.createElement("main");
            let html = cptable.utils.decode(932, atob(part.body));
            // 外部リンクのjump.phpを無効化
            html = html.replaceAll(`href="/bin/jump.php?`, `href="`);
            // CSSで消せないやつを消す
            // prettier-ignore
            html = html.replace(`[<a href="/b/futaba.htm">掲示板に戻る</a>]`, "");
            element.innerHTML = html;
            document.querySelector("#result").appendChild(element);
        }

        if (part.headers.includes("Content-Type: text/css")) {
            const element = document.createElement("style");
            element.innerHTML = cptable.utils.decode(932, atob(part.body));
            document.querySelector("#result").appendChild(element);
        }

        if (
            part.headers.includes("Content-Type: image") ||
            part.headers.includes("Content-Type: video")
        ) {
            const contentType = part.headers.match(/Content-Type: (.+)/)[1];

            const onelineBody = part.body.replace(/\n/g, "");
            const dataurl = `data:${contentType};base64,${onelineBody}`;

            const originalurl = part.headers.match(/Content-Location: (.+)/)[1];
            const relativePath =
                "/" + originalurl.split("/").slice(3).join("/");

            // 要素がある場合のみfetchしてblob URLを作る
            // サムネとリンクの置換どっちもやる

            const imageElement = document.querySelector(
                `[src="${relativePath}"]`
            );
            if (imageElement) {
                fetch(dataurl)
                    .then((res) => res.blob())
                    .then((blob) => {
                        imageElement.src = URL.createObjectURL(blob);
                    });
            }

            // リンクは複数ある可能性があるのでAll
            const linkElement = document.querySelectorAll(
                `[href="${relativePath}"]`
            );
            if ([...linkElement].length !== 0) {
                fetch(dataurl)
                    .then((res) => res.blob())
                    .then((blob) => {
                        const url = URL.createObjectURL(blob);
                        [...linkElement].forEach((element) => {
                            element.href = url;
                        });
                    });
            }
        }
    });
});
