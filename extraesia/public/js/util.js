window.findItemAccount = (message, item) => {
	let account = message[item.item_code]
    if (account == null) {
        account = message[item.item_group]
    }
    return account || "";
};