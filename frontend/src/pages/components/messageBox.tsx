interface MessageBoxProps {
    name: string;
    content: string;
    timeStamp: string;
}

function MessageBox({ name, content, timeStamp }: MessageBoxProps) {
    return (
        <div className="font-mono my-3">
            <div className="flex flex-rows justify-between">
                <h1 className="font-bold text-lg my-1">{name} :</h1>
                <h3 className="text-lg my-1 mr-6">{getDate(timeStamp)}</h3>
            </div>
            <p className="ml-6 text-md">{content}</p>
        </div>
    );
}

const getDate = (timestamp: string) => {
    // Convert timestamp to a Date object
    const date = new Date(parseInt(timestamp, 10));

    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "2-digit",
    };
    const formattedDate = date
        .toLocaleDateString("en-GB", options)
        .replace(/\s/g, "-");
    const formattedTime = date.toLocaleTimeString("en-GB", { hour12: false });

    return `${formattedDate} ${formattedTime}`;
};

export default MessageBox;
