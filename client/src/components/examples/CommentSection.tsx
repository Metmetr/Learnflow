import CommentSection from "../CommentSection";

export default function CommentSectionExample() {
  const mockComments = [
    {
      id: "1",
      author: {
        id: "user1",
        name: "Zeynep Demir",
      },
      content: "Çok faydalı bir yazı olmuş, teşekkürler!",
      createdAt: new Date(Date.now() - 3600000),
      replies: [
        {
          id: "2",
          author: {
            id: "user2",
            name: "Ahmet Yılmaz",
          },
          content: "Katılıyorum, özellikle örnekler çok açıklayıcı.",
          createdAt: new Date(Date.now() - 1800000),
        },
      ],
    },
    {
      id: "3",
      author: {
        id: "user3",
        name: "Elif Kaya",
      },
      content: "Bu konuyla ilgili daha fazla kaynak önerebilir misiniz?",
      createdAt: new Date(Date.now() - 7200000),
    },
  ];

  return <CommentSection comments={mockComments} currentUserId="user1" />;
}
