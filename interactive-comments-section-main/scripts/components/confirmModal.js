import { deleteReply } from "./comment.js";

export function toggleConfirmModal(comments) {
	// "this" here binding to the clicked delete button
	const currentComment = this.parentElement.parentElement;
	const modal = document.createElement("div");
	modal.className = "modal";
	modal.innerHTML = `
        <div class="modal__content">
            <h2 class="modal__heading">Delete comment</h2>
            <p>
                Are you sure you want to delete this comment? This will remove
                and can't be undone.
            </p>
            <div class="modal__options">
                <button class="btn btn--cancel">NO, CANCEL</button>
                <button class="btn btn--confirm">YES, DELETE</button>
            </div>
        </div>
    `;

	document.body.appendChild(modal);

	const [modalCancelButtonm, modalConfirmBtn] = modal.querySelectorAll(".btn");

	modalConfirmBtn.onclick = function () {
		deleteReply.call(currentComment, comments);
		modal.remove();
	};

	modalCancelButtonm.onclick = function () {
		modal.remove();
	};
}
