import { appendReply } from "./comment.js";

// Defines texting block element
export function createTextBlock({ image: { png } }, replyingTo) {
	const textBlock = document.createElement("form");
	textBlock.classList.add("reply__input");
	textBlock.dataset.replyingto = replyingTo;

	textBlock.innerHTML = `
        <img src=${png} alt="your user avatar"  class="user__avatar">
        <textarea class="reply__input-text" placeholder="Add a comment..." required ></textarea>
        <button class="btn reply__input-send" type="submit">SEND</button>
    `;

	return textBlock;
}

// Functionalities
export function confirmReply(e, comments, currentUser) {
	e.preventDefault();
	const input = this.querySelector("textarea");
	const content = input.value.replace(/<[^>]*>/, "");
	if (!content) return;

	let prevElement = this.previousElementSibling;
	const index = parseInt(prevElement.dataset.id);
	const currentReplyList = comments[index].replies;

	const newComment = {
		id:
			currentReplyList.length > 0
				? currentReplyList[currentReplyList.length - 1].id + 1
				: 0,
		content,
		score: 0,
		user: currentUser,
		replyingTo: this.dataset.replyingto,
		createdAt: "today",
		like: null
	};

	if (prevElement.className.includes("replies")) {
		// case 1: append the reply list
		comments[index].replies.push(newComment);
		localStorage.setItem(
			"interactive-comments-demo-data",
			JSON.stringify(comments)
		);

		if (prevElement.className.includes("replies__item"))
			prevElement = prevElement.parentElement;

		appendReply(
			index,
			currentReplyList.length - 1,
			prevElement,
			comments,
			currentUser
		);
	} else {
		// case 2: first reply
		const replies = document.createElement("div");
		replies.classList.add("replies");
		replies.dataset.id = index;

		comments[index].replies.push(newComment);
		localStorage.setItem(
			"interactive-comments-demo-data",
			JSON.stringify(comments)
		);
		appendReply(index, 0, replies, comments, currentUser);

		prevElement.after(replies);
	}

	this.remove();
}
