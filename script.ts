enum TagType {                                                                    /// defining a set of constants that can later be used.
  Paragraph,                                                                      /// In our case markdown tag types
  Header1,
  Header2,
  Header3,
  HorizontalRule,
  Ordered,
  List,
  Code,
  Break,
}

/// we need a code that can accept a number of strings to form a document (HTML tags + content)
/// we also need to get the document after finishing it.


interface IMarkdownDocument {                                                    /// define the properties of the markdown document
  Add(...content: string[]): void;                                               /// Add method: adding a string at the end of the array 
  Get(): string;                                                                 /// Get method: returns the content of the document as a string
}


class MarkdownDocument implements IMarkdownDocument {                           /// bow we can create our document
  private content: string = "";                                                 /// content at the start is an empty string
  
  Add(...content: string[]): void {                                             /// each element is added to the content
    content.forEach((element) => {
      this.content += element;
    });
  }

  Get(): string {                                                               /// returns the entire content
    return this.content;
  }
}

class ParseElement {
  CurrentLine: string = "";                                                    /// we'll process our document one line at a time
}



/// We'll want to apply various operations on that CurrentLine so we'll be using the visitor pattern



/// Visitor Pattern                                                             /// used to add new formatting and processing logic to the docuent without changinf the document's code


/// The Visitor

interface Ivisitor {                                                            
  visit(token: ParseElement, MarkdownDocument: IMarkdownDocument): void;        
}

abstract class VisitorBase implements Ivisitor {                                /// 
  constructor(
    private readonly tagType: TagType,                                          /// property: type of tag the visitor is visiting
    private readonly TagTypeToHtml: tagTypeToHtml                               /// property: takes the tag and turns it to the html equivalent
  ) {}

  visit(token: ParseElement, MarkdownDocument: IMarkdownDocument): void {       /// Method: the token the visitor is visiting + document we write on.
    MarkdownDocument.Add(                                                        
      this.TagTypeToHtml.openingTag(this.tagType),                              /// add the opening tag
      token.CurrentLine,                                                        /// then the text
      this.TagTypeToHtml.closingTag(this.tagType)                               /// then the closing tag
    );
  }
}

class Header1Visitor extends VisitorBase {                                      /// for each tag, we give it a tag type and create a new instance of tagTypeToHtml
  constructor() {
    super(TagType.Header1, new tagTypeToHtml());
  }
}

class Header2Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header2, new tagTypeToHtml());
  }
}

class Header3Visitor extends VisitorBase {
  constructor() {
    super(TagType.Header3, new tagTypeToHtml());
  }
}

class ParagraphVisitor extends VisitorBase {
  constructor() {
    super(TagType.Paragraph, new tagTypeToHtml());
  }
}

class HorizontalRuleVisitor extends VisitorBase {
  constructor() {
    super(TagType.HorizontalRule, new tagTypeToHtml());
  }
}

class ListVisitor extends VisitorBase {
  constructor() {
    super(TagType.List, new tagTypeToHtml());
  }
}

class CodeVisitor extends VisitorBase {
  constructor() {
    super(TagType.Code, new tagTypeToHtml());
  }
}
class BreakVisitor extends VisitorBase {
  constructor() {
    super(TagType.Break, new tagTypeToHtml());
  }
}


/// The visitable

interface Ivisitable {          
  accept(                                                                       /// Whenever we call accept, we want to visit the relevant visitor
    visitor: Ivisitor,    
    token: ParseElement,
    MarkdownDocument: IMarkdownDocument
  ): void;
}

/// as of now, we have the means to transfrom a simple line into an HTML encoded line.
/// now which tag should we apply?


/// Chain of responsibility pattern: Chain a series of classes that accept the next class in the chain


/// should I handle this? if not -> next

abstract class Handler<T> {                                                     /// Abstract class that checks wether the next can handle the request
  protected next: Handler<T> | null = null;                                     
  protected abstract CanHandle(request: T): boolean;

  public setNext(next: Handler<T>): void {                                      /// moves forward to the next element
    this.next = next;
  }

  public HandleRequest(request: T): void {                                      /// takes a request
    if (!this.CanHandle(request)) {                                             /// checks of current can't handle the request
      if (this.next !== null) {                                                 /// checks if the next element is not null
        this.next.HandleRequest(request);                                       /// tells the next to handle the reauest (recursive)
      }
      return;                                                                   /// end of chain or request handled
    }
  }
}

class ParseChainHandler extends Handler<ParseElement> {                         /// implements the above, takes the "CurrentLine"

  constructor(                                                                  /// accepts the document, the tagType and the visitor
    private readonly document: IMarkdownDocument,
    private readonly tagType: string,
    private readonly visitor: Ivisitor
  ) {
    super();
  }

  private readonly visitable: Ivisitable = new Visitable();                     /// creates a visitable with a visitor, a token and a markdown document

  protected CanHandle(request: ParseElement): boolean {                         /// apply the Can Handle on the CurrentLine
    let split = new LineParser().Parse(request.CurrentLine, this.tagType);      /// creates a split with the lineparser underneath (array with two outputs)
    if (split[0]) {                                                             /// if the first output is true
      request.CurrentLine = split[1];                                           /// the current line becomes the second output
      this.visitable.accept(this.visitor, request, this.document);              /// and the visitable will use the current line
    }
    return split[0];                                                            /// it returns true or false based on the split[0]
  }
}


class LineParser {                                                              /// Checks if the code starts with a tag

  public Parse(value: string, tag: string): [boolean, string] {                 /// takes a string value and the tag.
    let output: [boolean, string] = [false, ""];                                /// output will be a boolean and a string  (tuble)
    output[1] = value;                                                          /// the string will equal the value passed to it for safe return.
    if (value === "") {                                                       
      return output;                                                            /// if the string is empty, there's no tag, return false.
    }

    let split = value.startsWith(`${tag}`);                                     /// if the string starts with a "tag" (true or false)
    if (split) {                                                                /// split is true
      output[0] = true;                                                         /// set the boolean to true
      output[1] = value.substr(tag.length);                                     /// second output will get the tag.
    }
    return output;                                                              /// return both the output and the tag
  }
}

class ParagraphHandler extends Handler<ParseElement> {                          /// handles the paragraph <p></p> 
  private readonly visitable: Ivisitable = new Visitable();                      
  private readonly visitor: Ivisitor = new ParagraphVisitor();
  protected CanHandle(request: ParseElement): boolean {                         
    this.visitable.accept(this.visitor, request, this.document);
    return true;                                                                /// returns true if there's no tag
  }
  constructor(private readonly document: IMarkdownDocument) {
    super();
  }
}


/// the handlers of each tag

class Header1ChainHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "# ", new Header1Visitor());
  }
}

class Header2ChainHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "## ", new Header2Visitor());
  }
}

class Header3ChainHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "### ", new Header3Visitor());
  }
}

class HorizontalRuleHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "---", new HorizontalRuleVisitor());
  }
}

class ListHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "li", new ListVisitor());
  }
}

class CodeHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "code", new CodeVisitor());
  }
}

class BreakHandler extends ParseChainHandler {
  constructor(document: IMarkdownDocument) {
    super(document, "br", new BreakVisitor());
  }
}

class Visitable implements Ivisitable {
  accept(
    visitor: Ivisitor,
    token: ParseElement,
    MarkdownDocument: IMarkdownDocument
  ): void {
    visitor.visit(token, MarkdownDocument);
  }
}

class tagTypeToHtml {                                                           /// Translate between the tags and the equivalent HTML                    
  private readonly tagType: Map<TagType, string> = new Map<TagType, string>();  /// take a tag type and match it to an html tag.
  constructor() {                                                               /// you're translating by generating key-value pairs for each type
    this.tagType.set(TagType.Header1, "h1");                                    
    this.tagType.set(TagType.Header2, "h2");
    this.tagType.set(TagType.Header3, "h3");
    this.tagType.set(TagType.Paragraph, "p");
    this.tagType.set(TagType.HorizontalRule, "hr");
    this.tagType.set(TagType.List, "li");
    this.tagType.set(TagType.Code, "code");
    this.tagType.set(TagType.Break, "br");
  }

  public openingTag(tagType: TagType): string {                               /// create an opening tag
    return this.GetTag(tagType, `<`);
  }

  public closingTag(tagType: TagType): string {                               /// create a closing tag
    return this.GetTag(tagType, `</`);
  }

  private GetTag(tagType: TagType, openingTagPattern: string) {               /// We need to get the opening and closing tags from the tagtype... 
    let tag = this.tagType.get(tagType);                                      /// As it's a very similar process, we'll just check for the opening pattern. 
    if (tag !== null) {                                                       /// Check for existence of tag
      return `${openingTagPattern}${tag} classname='instruction__${tag}'>`;                                   /// return the tag with the opening pattern
    }                                           
    return `${openingTagPattern}p>`;                                          /// return the paragraph tag with the opening pattern.
  }
}



class ChainOfResponsibilityFactory {
  Build(document: IMarkdownDocument): ParseChainHandler {
    let header1: Header1ChainHandler = new Header1ChainHandler(document);
    let header2: Header2ChainHandler = new Header2ChainHandler(document);
    let header3: Header3ChainHandler = new Header3ChainHandler(document);
    let horizontalRule: HorizontalRuleHandler = new HorizontalRuleHandler(document);
    let list: ListHandler = new ListHandler(document);
    let code: CodeHandler = new CodeHandler(document);
    let paragraph: ParagraphHandler = new ParagraphHandler(document);

    
    header1.setNext(header2);
    header2.setNext(header3);
    header3.setNext(horizontalRule);
    horizontalRule.setNext(list);
    list.setNext(code);
    code.setNext(paragraph);
    return header1;
  }
}

class Markdown {
  public ToHtml(text: string): string {
    let document: IMarkdownDocument = new MarkdownDocument();
    let header1: Header1ChainHandler = new ChainOfResponsibilityFactory().Build(
      document
    );
    let lines: string[] = text.split(`\n`);
    for (let index = 0; index < lines.length; index++) {
      let parseElement: ParseElement = new ParseElement();
      parseElement.CurrentLine = lines[index];
      header1.HandleRequest(parseElement);
    }
    return document.Get();
  }
}

class HtmlHandler {
  private markdownChange: Markdown = new Markdown();
  
  public TextChangeHandler(id: string, output: string): void {
    let markdown = <HTMLTextAreaElement>document.getElementById(id);
    let markdownOutput = <HTMLDivElement>document.getElementById(output);
    let copyButton = <HTMLButtonElement>document.getElementById("copy-button")

    copyButton.addEventListener("click", () => {
      let text = markdownOutput.innerHTML                                     /// I swear to god it took me 3 days to remember to use innerHTML.
      navigator.clipboard.writeText(text)
    })


    if (markdown !== null) {
      markdown.onkeyup = (e) => {
        this.RenderHtmlContent(markdown, markdownOutput);
      };

      window.onload = (e) => {
        this.RenderHtmlContent(markdown, markdownOutput);
      };
    }
  }

  private RenderHtmlContent(
    markdown: HTMLTextAreaElement,
    markdownOutput: HTMLDivElement
  ) {
    if (markdown.value) {
      markdownOutput.innerHTML = this.markdownChange.ToHtml(markdown.value);
    } else markdownOutput.innerHTML = "";
  }

}



new HtmlHandler().TextChangeHandler("markdown", "markdown-output");
