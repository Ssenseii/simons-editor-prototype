var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TagType;
(function (TagType) {
    TagType[TagType["Paragraph"] = 0] = "Paragraph";
    TagType[TagType["Header1"] = 1] = "Header1";
    TagType[TagType["Header2"] = 2] = "Header2";
    TagType[TagType["Header3"] = 3] = "Header3";
    TagType[TagType["HorizontalRule"] = 4] = "HorizontalRule";
    TagType[TagType["Ordered"] = 5] = "Ordered";
    TagType[TagType["List"] = 6] = "List";
    TagType[TagType["Code"] = 7] = "Code";
    TagType[TagType["Break"] = 8] = "Break";
})(TagType || (TagType = {}));
var MarkdownDocument = /** @class */ (function () {
    function MarkdownDocument() {
        this.content = ""; /// content at the start is an empty string
    }
    MarkdownDocument.prototype.Add = function () {
        var _this = this;
        var content = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            content[_i] = arguments[_i];
        }
        content.forEach(function (element) {
            _this.content += element;
        });
    };
    MarkdownDocument.prototype.Get = function () {
        return this.content;
    };
    return MarkdownDocument;
}());
var ParseElement = /** @class */ (function () {
    function ParseElement() {
        this.CurrentLine = ""; /// we'll process our document one line at a time
    }
    return ParseElement;
}());
var VisitorBase = /** @class */ (function () {
    function VisitorBase(tagType, /// property: type of tag the visitor is visiting
    TagTypeToHtml /// property: takes the tag and turns it to the html equivalent
    ) {
        this.tagType = tagType;
        this.TagTypeToHtml = TagTypeToHtml;
    }
    VisitorBase.prototype.visit = function (token, MarkdownDocument) {
        MarkdownDocument.Add(this.TagTypeToHtml.openingTag(this.tagType), /// add the opening tag
        token.CurrentLine, /// then the text
        this.TagTypeToHtml.closingTag(this.tagType) /// then the closing tag
        );
    };
    return VisitorBase;
}());
var Header1Visitor = /** @class */ (function (_super) {
    __extends(Header1Visitor, _super);
    function Header1Visitor() {
        return _super.call(this, TagType.Header1, new tagTypeToHtml()) || this;
    }
    return Header1Visitor;
}(VisitorBase));
var Header2Visitor = /** @class */ (function (_super) {
    __extends(Header2Visitor, _super);
    function Header2Visitor() {
        return _super.call(this, TagType.Header2, new tagTypeToHtml()) || this;
    }
    return Header2Visitor;
}(VisitorBase));
var Header3Visitor = /** @class */ (function (_super) {
    __extends(Header3Visitor, _super);
    function Header3Visitor() {
        return _super.call(this, TagType.Header3, new tagTypeToHtml()) || this;
    }
    return Header3Visitor;
}(VisitorBase));
var ParagraphVisitor = /** @class */ (function (_super) {
    __extends(ParagraphVisitor, _super);
    function ParagraphVisitor() {
        return _super.call(this, TagType.Paragraph, new tagTypeToHtml()) || this;
    }
    return ParagraphVisitor;
}(VisitorBase));
var HorizontalRuleVisitor = /** @class */ (function (_super) {
    __extends(HorizontalRuleVisitor, _super);
    function HorizontalRuleVisitor() {
        return _super.call(this, TagType.HorizontalRule, new tagTypeToHtml()) || this;
    }
    return HorizontalRuleVisitor;
}(VisitorBase));
var ListVisitor = /** @class */ (function (_super) {
    __extends(ListVisitor, _super);
    function ListVisitor() {
        return _super.call(this, TagType.List, new tagTypeToHtml()) || this;
    }
    return ListVisitor;
}(VisitorBase));
var CodeVisitor = /** @class */ (function (_super) {
    __extends(CodeVisitor, _super);
    function CodeVisitor() {
        return _super.call(this, TagType.Code, new tagTypeToHtml()) || this;
    }
    return CodeVisitor;
}(VisitorBase));
var BreakVisitor = /** @class */ (function (_super) {
    __extends(BreakVisitor, _super);
    function BreakVisitor() {
        return _super.call(this, TagType.Break, new tagTypeToHtml()) || this;
    }
    return BreakVisitor;
}(VisitorBase));
/// as of now, we have the means to transfrom a simple line into an HTML encoded line.
/// now which tag should we apply?
/// Chain of responsibility pattern: Chain a series of classes that accept the next class in the chain
/// should I handle this? if not -> next
var Handler = /** @class */ (function () {
    function Handler() {
        this.next = null;
    }
    Handler.prototype.setNext = function (next) {
        this.next = next;
    };
    Handler.prototype.HandleRequest = function (request) {
        if (!this.CanHandle(request)) { /// checks of current can't handle the request
            if (this.next !== null) { /// checks if the next element is not null
                this.next.HandleRequest(request); /// tells the next to handle the reauest (recursive)
            }
            return; /// end of chain or request handled
        }
    };
    return Handler;
}());
var ParseChainHandler = /** @class */ (function (_super) {
    __extends(ParseChainHandler, _super);
    function ParseChainHandler(/// accepts the document, the tagType and the visitor
    document, tagType, visitor) {
        var _this = _super.call(this) || this;
        _this.document = document;
        _this.tagType = tagType;
        _this.visitor = visitor;
        _this.visitable = new Visitable(); /// creates a visitable with a visitor, a token and a markdown document
        return _this;
    }
    ParseChainHandler.prototype.CanHandle = function (request) {
        var split = new LineParser().Parse(request.CurrentLine, this.tagType); /// creates a split with the lineparser underneath (array with two outputs)
        if (split[0]) { /// if the first output is true
            request.CurrentLine = split[1]; /// the current line becomes the second output
            this.visitable.accept(this.visitor, request, this.document); /// and the visitable will use the current line
        }
        return split[0]; /// it returns true or false based on the split[0]
    };
    return ParseChainHandler;
}(Handler));
var LineParser = /** @class */ (function () {
    function LineParser() {
    }
    LineParser.prototype.Parse = function (value, tag) {
        var output = [false, ""]; /// output will be a boolean and a string  (tuble)
        output[1] = value; /// the string will equal the value passed to it for safe return.
        if (value === "") {
            return output; /// if the string is empty, there's no tag, return false.
        }
        var split = value.startsWith("".concat(tag)); /// if the string starts with a "tag" (true or false)
        if (split) { /// split is true
            output[0] = true; /// set the boolean to true
            output[1] = value.substr(tag.length); /// second output will get the tag.
        }
        return output; /// return both the output and the tag
    };
    return LineParser;
}());
var ParagraphHandler = /** @class */ (function (_super) {
    __extends(ParagraphHandler, _super);
    function ParagraphHandler(document) {
        var _this = _super.call(this) || this;
        _this.document = document;
        _this.visitable = new Visitable();
        _this.visitor = new ParagraphVisitor();
        return _this;
    }
    ParagraphHandler.prototype.CanHandle = function (request) {
        this.visitable.accept(this.visitor, request, this.document);
        return true; /// returns true if there's no tag
    };
    return ParagraphHandler;
}(Handler));
/// the handlers of each tag
var Header1ChainHandler = /** @class */ (function (_super) {
    __extends(Header1ChainHandler, _super);
    function Header1ChainHandler(document) {
        return _super.call(this, document, "# ", new Header1Visitor()) || this;
    }
    return Header1ChainHandler;
}(ParseChainHandler));
var Header2ChainHandler = /** @class */ (function (_super) {
    __extends(Header2ChainHandler, _super);
    function Header2ChainHandler(document) {
        return _super.call(this, document, "## ", new Header2Visitor()) || this;
    }
    return Header2ChainHandler;
}(ParseChainHandler));
var Header3ChainHandler = /** @class */ (function (_super) {
    __extends(Header3ChainHandler, _super);
    function Header3ChainHandler(document) {
        return _super.call(this, document, "### ", new Header3Visitor()) || this;
    }
    return Header3ChainHandler;
}(ParseChainHandler));
var HorizontalRuleHandler = /** @class */ (function (_super) {
    __extends(HorizontalRuleHandler, _super);
    function HorizontalRuleHandler(document) {
        return _super.call(this, document, "---", new HorizontalRuleVisitor()) || this;
    }
    return HorizontalRuleHandler;
}(ParseChainHandler));
var ListHandler = /** @class */ (function (_super) {
    __extends(ListHandler, _super);
    function ListHandler(document) {
        return _super.call(this, document, "li", new ListVisitor()) || this;
    }
    return ListHandler;
}(ParseChainHandler));
var CodeHandler = /** @class */ (function (_super) {
    __extends(CodeHandler, _super);
    function CodeHandler(document) {
        return _super.call(this, document, "code", new CodeVisitor()) || this;
    }
    return CodeHandler;
}(ParseChainHandler));
var BreakHandler = /** @class */ (function (_super) {
    __extends(BreakHandler, _super);
    function BreakHandler(document) {
        return _super.call(this, document, "br", new BreakVisitor()) || this;
    }
    return BreakHandler;
}(ParseChainHandler));
var Visitable = /** @class */ (function () {
    function Visitable() {
    }
    Visitable.prototype.accept = function (visitor, token, MarkdownDocument) {
        visitor.visit(token, MarkdownDocument);
    };
    return Visitable;
}());
var tagTypeToHtml = /** @class */ (function () {
    function tagTypeToHtml() {
        this.tagType = new Map(); /// take a tag type and match it to an html tag.
        this.tagType.set(TagType.Header1, "h1");
        this.tagType.set(TagType.Header2, "h2");
        this.tagType.set(TagType.Header3, "h3");
        this.tagType.set(TagType.Paragraph, "p");
        this.tagType.set(TagType.HorizontalRule, "hr");
        this.tagType.set(TagType.List, "li");
        this.tagType.set(TagType.Code, "code");
        this.tagType.set(TagType.Break, "br");
    }
    tagTypeToHtml.prototype.openingTag = function (tagType) {
        return this.GetTag(tagType, "<");
    };
    tagTypeToHtml.prototype.closingTag = function (tagType) {
        return this.GetTag(tagType, "</");
    };
    tagTypeToHtml.prototype.GetTag = function (tagType, openingTagPattern) {
        var tag = this.tagType.get(tagType); /// As it's a very similar process, we'll just check for the opening pattern. 
        if (tag !== null) { /// Check for existence of tag
            return "".concat(openingTagPattern).concat(tag, " classname='instruction__").concat(tag, "'>"); /// return the tag with the opening pattern
        }
        return "".concat(openingTagPattern, "p>"); /// return the paragraph tag with the opening pattern.
    };
    return tagTypeToHtml;
}());
var ChainOfResponsibilityFactory = /** @class */ (function () {
    function ChainOfResponsibilityFactory() {
    }
    ChainOfResponsibilityFactory.prototype.Build = function (document) {
        var header1 = new Header1ChainHandler(document);
        var header2 = new Header2ChainHandler(document);
        var header3 = new Header3ChainHandler(document);
        var horizontalRule = new HorizontalRuleHandler(document);
        var list = new ListHandler(document);
        var code = new CodeHandler(document);
        var paragraph = new ParagraphHandler(document);
        header1.setNext(header2);
        header2.setNext(header3);
        header3.setNext(horizontalRule);
        horizontalRule.setNext(list);
        list.setNext(code);
        code.setNext(paragraph);
        return header1;
    };
    return ChainOfResponsibilityFactory;
}());
var Markdown = /** @class */ (function () {
    function Markdown() {
    }
    Markdown.prototype.ToHtml = function (text) {
        var document = new MarkdownDocument();
        var header1 = new ChainOfResponsibilityFactory().Build(document);
        var lines = text.split("\n");
        for (var index = 0; index < lines.length; index++) {
            var parseElement = new ParseElement();
            parseElement.CurrentLine = lines[index];
            header1.HandleRequest(parseElement);
        }
        return document.Get();
    };
    return Markdown;
}());
var HtmlHandler = /** @class */ (function () {
    function HtmlHandler() {
        this.markdownChange = new Markdown();
    }
    HtmlHandler.prototype.TextChangeHandler = function (id, output) {
        var _this = this;
        var markdown = document.getElementById(id);
        var markdownOutput = document.getElementById(output);
        var copyButton = document.getElementById("copy-button");
        copyButton.addEventListener("click", function () {
            var text = markdownOutput.innerHTML; /// I swear to god it took me 3 days to remember to use innerHTML.
            navigator.clipboard.writeText(text);
        });
        if (markdown !== null) {
            markdown.onkeyup = function (e) {
                _this.RenderHtmlContent(markdown, markdownOutput);
            };
            window.onload = function (e) {
                _this.RenderHtmlContent(markdown, markdownOutput);
            };
        }
    };
    HtmlHandler.prototype.RenderHtmlContent = function (markdown, markdownOutput) {
        if (markdown.value) {
            markdownOutput.innerHTML = this.markdownChange.ToHtml(markdown.value);
        }
        else
            markdownOutput.innerHTML = "";
    };
    return HtmlHandler;
}());
new HtmlHandler().TextChangeHandler("markdown", "markdown-output");
