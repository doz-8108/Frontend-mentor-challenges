import { toggleConfirmModal } from "./confirmModal.js";

// Defines comment (or reply for comment) element
export function createComment(comment, isCurrentUser = false, isReply = false) {
	const { id, content, createdAt, score, user } = comment;
	const commentBlock = document.createElement("div");
	commentBlock.classList.add("comment");
	if (isReply !== false) commentBlock.classList.add("replies__item");

	// data-id for identifying which comment it belongs to
	// data-replyId indicates the index of the reply
	commentBlock.dataset.id = id - 1;
	commentBlock.dataset.replyId = isReply;

	commentBlock.innerHTML = `
        <div class="comment__rating">
            <button name="plus" class="comment__rating-like" value="1" data-id="${id}" ${
		isReply !== false ? "data-replyId=" + isReply : ""
	}>
            </button>
            <span>${score}</span>
            <button name="minus" class="comment__rating-dislike" value="-1" data-id="${id}" ${
		isReply !== false ? "data-replyId=" + isReply : ""
	}>
            </button>
        </div>
        <div class="user">
            <img class="user__avatar" src=${user.image.png} alt="avatar">
            <span class="user__name">${user.username}</span>
            <span class="user__createdAt ${
					isCurrentUser ? "user--currentUser" : ""
				}">${createdAt}</span>
        </div>
        ${
				isCurrentUser
					? `
						<div class="options">
							<button class="options__block options__block--delete">
								<img src="./images/icon-delete.svg" alt="delete button icon">
								<span>Delete</span>
							</button>
							<button class="options__block options__block--edit">
								<img src="./images/icon-edit.svg" alt="edit button icon">
								<span>Edit</span>
							</button>
						</div>
            `
					: `<button class="reply">            <img src="./images/icon-reply.svg" alt="reply button icon">
        <span>Reply</span>        </button>`
			}
        <p>${
				comment.replyingTo
					? "<span class='tag'>@" + comment.replyingTo + "</span> "
					: ""
			}${content}</p>
    `;

	return commentBlock;
}

// Functionalities
export function deleteReply(comments) {
	// "this" here binding to the clicked delete button
	const { id, replyId } = this.dataset;
	comments[id].replies.splice(replyId, 1);

	localStorage.setItem(
		"interactive-comments-demo-data",
		JSON.stringify(comments)
	);

	this.remove();
}

export function editReply(comments) {
	// "this" here binding to the caller
	// either called by edit button (on comment element) or update button (on text block)
	// access the dataset from their (grand) parent element, the comment block
	const parent = this.parentElement.classList.contains("replies__item")
		? this.parentElement
		: this.parentElement.parentElement;

	// default state [paragraph] | edit state [textarea]
	parent.classList.toggle("replies__item--edit");
	const target = parent.querySelector("p") || parent.querySelector("textarea");

	// remove name tag before editing
	let tag = target.querySelector(".tag");
	if (tag) tag.remove();

	// toggle between default state and edit states
	const editable = document.createElement(
		target.matches("p") ? "textarea" : "p"
	);

	editable[target.matches("p") ? "value" : "textContent"] =
		target[target.matches("p") ? "textContent" : "value"];

	if (target.matches("textarea")) {
		comments[parent.dataset.id].replies[parent.dataset.replyId].content =
			target.value.replace(/<[^>]*>/, "");
		localStorage.setItem(
			"interactive-comments-demo-data",
			JSON.stringify(comments)
		);
	}

	// adding back the @ tag
	tag = document.createElement("span");
	tag.classList.add("tag");
	tag.textContent = `@${
		comments[parent.dataset.id].replies[parent.dataset.replyId].replyingTo
	}`;

	editable.matches("p") && editable.prepend(tag);

	// toggle between default state and edit elements
	target.replaceWith(editable);

	// insert the confirm update button
	const insertedBtn = parent.querySelector("button.btn");
	if (!insertedBtn) {
		const updateButton = document.createElement("button");
		updateButton.textContent = "UPDATE";
		updateButton.className = "btn btn--edit";
		updateButton.onclick = editReply.bind(this, comments);
		parent.appendChild(updateButton);
	} else insertedBtn.remove();
}

export function appendReply(index, replyId, parent, comments, currentUser) {
	comments[index].replies[replyId] = {
		like: null,
		...comments[index].replies[replyId]
	};

	const isCurrentUser =
		comments[index].replies[replyId].user.username === currentUser.username;
	const newComment = createComment(
		{ ...comments[index].replies[replyId], id: index + 1 },
		isCurrentUser,
		replyId
	);
	if (isCurrentUser) {
		newComment
			.querySelector(".options__block--delete")
			.addEventListener("click", function () {
				toggleConfirmModal.call(this, comments);
			});

		newComment
			.querySelector(".options__block--edit")
			.addEventListener("click", function () {
				editReply.call(this, comments);
			});
	}

	newComment.querySelectorAll("button[class*='like']").forEach(btn =>
		btn.addEventListener("click", function () {
			rate.call(this, comments);
		})
	);
	parent.appendChild(newComment);

	// if voted before (localstorage saved) then just update the button state
	const like = comments[index].replies[replyId].like;
	if (like) {
		newComment.querySelector(
			`button[name="${like}"]`
		).style.backgroundImage = `url("./images/icon-${like}-hover.svg")`;
	}
}

export function rate(comments) {
	const index = this.dataset.id - 1;
	const dataSrc = this.dataset.replyid
		? comments[index].replies[this.dataset.replyid]
		: comments[index];

	if (this.name === "plus") {
		if (dataSrc.like === "plus") {
			// upvoted already then cancel that vote
			dataSrc.like = null;
			dataSrc.score -= 1;
			this.style.backgroundImage = `url("./images/icon-${this.name}.svg")`;
		} else {
			// not have any vote yet then just upvote it or cancel the downvote
			dataSrc.score += dataSrc.like === null ? 1 : 2;
			dataSrc.like = "plus";
			this.style.backgroundImage = `url("./images/icon-${this.name}-hover.svg")`;
		}
	}

	// downvote applies the same logic as upvote
	if (this.name === "minus") {
		if (dataSrc.like === "minus") {
			dataSrc.like = null;
			dataSrc.score += 1;
			this.style.backgroundImage = `url("./images/icon-${this.name}.svg")`;
		} else {
			dataSrc.score -= dataSrc.like === null ? 1 : 2;
			dataSrc.like = "minus";
			this.style.backgroundImage = `url("./images/icon-${this.name}-hover.svg")`;
		}
	}

	// update the score text
	(
		this.previousElementSibling || this.nextElementSibling
	).textContent = `${dataSrc["score"]}`;
	const siblingBtn = this.parentElement.querySelector(
		`button[name=${this.value < 0 ? "plus" : "minus"}]`
	);

	// update the state of button
	siblingBtn.style.backgroundImage = `url("./images/icon-${
		this.value < 0 ? "plus" : "minus"
	}.svg")`;

	// update the local storage
	localStorage.setItem(
		"interactive-comments-demo-data",
		JSON.stringify(comments)
	);
}
