/**
 * Every converter need to supply the following methods:
 * addPart(orig, gloss) - Called everytime a new glossing entry should be added.
 *     orig contains the word in the original language, split into parts
 *     gloss contains the glossed version, split into parts
 * endLine(meaning) - Called once an entire sentence has been added.
 *     meaning contains the free translation of the sentence
 * finish() - Called once everything has been added. The time to display the result to the user.
 */

// Converts to reddit friendly markdown
var RedditConverter = function (output, smallCaps) {
	// Empty header row to sopport left alignment
	this.header = "|"
	// Markdown needs a middle row to seperate heading from content
	this.centerLine = "|";
	this.orig = "|";
	this.gloss    = "|";

	this.lines = "-----\n\n";

	this.useSmallCaps = smallCaps;
	this.output = output;
}
RedditConverter.prototype.addPart = function(orig, gloss) {
	this.orig += "***" + orig.join("") + "***";
	for (var i = 0; i < gloss.length; i += 1) {
		if (gloss[i].length > 1 && gloss[i] === gloss[i].toUpperCase()) {
			if (this.useSmallCaps) {
				this.gloss += "*_" + gloss[i].toLowerCase() + "_*";
			} else {
				this.gloss += gloss[i];
			}
		} else {
			this.gloss += gloss[i];
		}
	}

	this.header += "|";
	this.orig += "|";
	this.centerLine += ":-|";
	this.gloss += "|";
};
RedditConverter.prototype.endLine = function(meaning = "") {
	this.lines += this.header + "\n";
	this.lines += this.centerLine + "\n";
	this.lines += this.orig + "\n";
	this.lines += this.gloss + "\n";
	this.lines += "*" + meaning + "*" + "\n";
	this.lines += "\n-----\n\n";

	this.header = "|"
	this.centerLine = "|";
	this.orig = "|";
	this.gloss    = "|";
};
RedditConverter.prototype.finish = function() {
	this.output.html(this.lines);
}

var PlaintextConverter = function (output, smallCaps) {
	this.orig = "";
	this.gloss = "";

	this.lines = "";

	this.useSmallCaps = smallCaps;
	this.output = output;
}
PlaintextConverter.prototype.addPart = function(orig, gloss) {
	this.orig += orig.join("") + " ";
	for (var i = 0; i < gloss.length; i += 1) {
		if (gloss[i].length > 1 && gloss[i] === gloss[i].toUpperCase()) {
			if (this.useSmallCaps) {
				this.gloss += toUnicodeSmallCaps(gloss[i]);
			} else {
				this.gloss += gloss[i];
			}
		} else {
			this.gloss += gloss[i];
		}
	}
	this.gloss += " ";

	while (this.orig.length < this.gloss.length) {
		this.orig += " ";
	}
	while (this.gloss.length < this.orig.length) {
		this.gloss += " ";
	}
};
PlaintextConverter.prototype.endLine = function(meaning = "") {
	this.lines += this.orig + "\n";
	this.lines += this.gloss + "\n";
	this.lines += meaning + "\n";
	this.lines += "\n";

	this.orig = "";
	this.gloss    = "";
};
PlaintextConverter.prototype.finish = function() {
	this.output.html(this.lines);
}

function toUnicodeSmallCaps(input) {
	var table = [];
	table["A"] = "ᴀ";
	table["B"] = "ʙ";
	table["C"] = "ᴄ";
	table["D"] = "ᴅ";
	table["E"] = "ᴇ";
	table["F"] = "ꜰ";
	table["G"] = "ɢ";
	table["H"] = "ʜ";
	table["I"] = "ɪ";
	table["J"] = "ᴊ";
	table["K"] = "ᴋ";
	table["L"] = "ʟ";
	table["M"] = "ᴍ";
	table["N"] = "ɴ";
	table["O"] = "ᴏ";
	table["P"] = "ᴘ";
	// table["Q"] = "Q";
	table["R"] = "ʀ";
	table["S"] = "ꜱ";
	table["T"] = "ᴛ";
	table["U"] = "ᴜ";
	table["V"] = "ᴠ";
	table["W"] = "ᴡ";
	// table["X"] = "X";
	table["Y"] = "ʏ";
	table["Z"] = "ᴢ";

	var result = "";

	for (var i = 0; i < input.length; i++) {
		var c = input[i];
		if (c in table) {
			result += table[c];
		} else {
			result += c;
		}
	}

	return result;
}

function convertToReddit() {
	var output = $("<textarea id=\"output\" readonly></textarea>");
	conv = new RedditConverter(output, $("#smallcaps").is(":checked"));
	convert(conv);
	$("#out").html("");
	output.appendTo("#out");
}
function convertToPlain() {
	var output = $("<textarea id=\"output\" readonly></textarea>");
	conv = new PlaintextConverter(output, $("#smallcaps").is(":checked"));
	convert(conv);
	$("#out").html("");
	output.appendTo("#out");
}

// Splits a single glossing entry into it's parts
// "dog-ACC-PL" -> ["dog", "-", "ACC", "-", "PL"]
function splitEntry(entry) {
	var result = [];
	var word = "";
	for (var i = 0; i < entry.length; i++) {
		if (["-", "=", "."].indexOf(entry[i]) != -1) {
			result.push(word);
			word = "";
			result.push(entry[i]);
		} else {
			word += entry[i];
		}
	}
	if (!(word === "")) {
		result.push(word);
	}

	return result;
}

// Converts the text in the input field using a specified converter
function convert(converter) {
	var lines = $("#input").val().split("\n").map($.trim).filter(function(x) { return !(x === ""); });

	var i = 0;
	while (i < lines.length) {
		var orig = lines[i];
		i++; if (i >= lines.length) { alert("Uneven number of non-quoted lines"); break; }

		var gloss = lines[i]; 
		i++;

		var meaning = "";
		if (i < lines.length && ["'", "\""].indexOf(lines[i][0]) != -1) {
			meaning = lines[i];
			i++;
		}

		var origEntries = orig.split(" ").map($.trim).filter(function(x) { return !(x === ""); });
		var glossEntries = gloss.split(" ").map($.trim).filter(function(x) { return !(x === ""); });
		if (origEntries.length != glossEntries.length) {
			alert("Text and gloss have unequal number of parts!");
		}
		for (var a = 0; a < origEntries.length; a++) {
			converter.addPart(splitEntry(origEntries[a]), splitEntry(glossEntries[a]));
		}
		converter.endLine(meaning);
	}
	converter.finish();
}

$( window ).load(function() {
	$("#reddit").click(convertToReddit);
	$("#plain").click(convertToPlain);
});