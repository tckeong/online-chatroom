import MessageBox from "./messageBox";
import { Message } from "./chatContent";

interface ContentBoxProps {
    position: string;
    messages: Message[];
}

function ContentBox({ position, messages }: ContentBoxProps) {
    const className = `overflow-y-scroll overflow-x-hidden pl-5 lg:pl-8 mb-4 ${position}`;

    return (
        <div className={className}>
            {messages.map((message, index) =>
                message.isPrivate ? (
                    <MessageBox
                        key={index}
                        name={message.username + " (private message)"}
                        content={message.content}
                        timeStamp={message.timeStamp}
                    />
                ) : (
                    <MessageBox
                        key={index}
                        name={message.username}
                        content={message.content}
                        timeStamp={message.timeStamp}
                    />
                )
            )}
        </div>
    );
}

export default ContentBox;
