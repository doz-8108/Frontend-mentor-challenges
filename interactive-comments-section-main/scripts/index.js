import { createComment, appendReply, rate } from "./components/comment.js";
import { createTextBlock, confirmReply } from "./components/textBlock.js";

(async () => {
	let { currentUser, comments } = await (await fetch("./data.json")).json();
	comments =
		JSON.parse(localStorage.getItem("interactive-comments-demo-data")) ||
		comments;

	const mainElement = document.querySelector("main");
	comments.forEach((comment, index) => {
		comments[index] = { like: null, ...comment };

		// mount comments that already exist
		const isCurrentUser = comment.user.username === currentUser.username;
		const newComment = createComment(comments[index], isCurrentUser);
		newComment.querySelectorAll("button[class*='like']").forEach(btn =>
			btn.addEventListener("click", function () {
				rate.call(this, comments);
			})
		);
		mainElement.appendChild(newComment);

		// if voted before (local storage) then just update the button state
		let { like } = comments[index];
		if (like) {
			newComment.querySelector(
				`button[name="${like}"]`
			).style.backgroundImage = `url("./images/icon-${like}-hover.svg")`;
		}

		// Append replies
		if (comment.replies.length) {
			const replies = document.createElement("div");
			replies.classList.add("replies");
			replies.dataset.id = index;

			comment.replies.forEach((reply, replyId) => {
				appendReply(index, replyId, replies, comments, currentUser);
			});

			mainElement.appendChild(replies);
		}
	});

	function appendTextBlock() {
		const replyingTo =
			this.parentElement.querySelector(".user__name").textContent;
		const textBlock = createTextBlock(currentUser, replyingTo);
		textBlock.addEventListener("submit", function (e) {
			confirmReply.call(this, e, comments, currentUser);
		});

		const nextElement = this.parentElement.nextElementSibling;
		if (nextElement?.classList.contains("reply__input"))
			return nextElement.remove();

		if (nextElement?.classList.contains("replies")) {
			if (nextElement.nextElementSibling?.classList.contains("reply__input"))
				return nextElement.nextElementSibling.remove();

			textBlock.classList.add("reply__input--afterReplies");
			nextElement.after(textBlock);
			return textBlock.scrollIntoView();
		}

		if (this.parentElement.classList.contains("replies__item"))
			textBlock.classList.add("reply__input--nested");

		this.parentElement.after(textBlock);
		textBlock.scrollIntoView({ behavior: "smooth" });
	}

	const replyButtons = document.querySelectorAll("button.reply");
	replyButtons.forEach(btn => btn.addEventListener("click", appendTextBlock));
})();

// ############# should be much more easier with React :( #############
