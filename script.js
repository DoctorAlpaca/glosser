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
var RedditConverter = function (output) {
	this.orig = "|";
	// Markdown needs a middle row to seperate heading from content
	this.centerLine = "|";
	this.gloss    = "|";

	this.lines = "";

	this.output = output;
}
RedditConverter.prototype.addPart = function(orig, gloss) {
	this.orig += "***" + orig.join("") + "***";
	for (var i = 0; i < gloss.length; i += 1) {
		if (gloss[i].length > 1 && gloss[i] === gloss[i].toUpperCase()) {
			this.gloss += "*_" + gloss[i].toLowerCase() + "_*";
		} else {
			this.gloss += gloss[i];
		}
	}

	this.orig += "|";
	this.centerLine += "-|";
	this.gloss += "|";
};
RedditConverter.prototype.endLine = function(meaning = "") {
	this.lines += this.orig + "\n";
	this.lines += this.centerLine + "\n";
	this.lines += this.gloss + "\n";
	this.lines += meaning + "\n";
	this.lines += "\n";

	this.orig = "";
	this.centerLine = "|";
	this.gloss    = "|";
};
RedditConverter.prototype.finish = function() {
	this.output.html(this.lines);
}

function convertToReddit() {
	var output = $("<textarea id=\"output\" readonly></textarea>");
	conv = new RedditConverter(output);
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

	console.log(lines);

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

		var origEntries = orig.split(" ");
		var glossEntries = gloss.split(" ");
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
});