export default {
    getTagInfo: () => {
        return {
            code: 200,
            message: "请求成功",
            data: {
                list: [
                    { tagId: 1, tagName: 'CSS', color: '#0011ff' },
                    { tagId: 2, tagName: 'Java', color: '#00ffe5' },
                    { tagId: 3, tagName: 'JavaScript', color: '#72eaff' },
                    { tagId: 4, tagName: 'Nodejs', color: '#72ff95' },
                    { tagId: 5, tagName: 'Vue', color: '#bdff72' },
                    { tagId: 6, tagName: 'Springboot', color: '#ffce72' },
                    { tagId: 7, tagName: 'MySQL', color: '#d694ff' },
                    { tagId: 8, tagName: 'PHP', color: '#fb7b7b' },
                ]
            }
        }
    }
}