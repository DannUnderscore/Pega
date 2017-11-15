export function setupUI() {
    let $ = document.querySelector.bind(document);

    window.addEventListener("load", function () {

        $(".title__sub").onclick = function () {
            window.location.reload();
        };

        let showingMenu = false;
        $(".intro__title__text").onclick = function () {
            if (showingMenu) {
                Velocity($("#sidebar"), {
                    left: "-33%",
                    opacity: 0
                }, 500);
            } else {
                Velocity($("#sidebar"), {
                    left: 0,
                    opacity: 1
                }, 500);
            }

            showingMenu = !showingMenu;
        }
    });
}