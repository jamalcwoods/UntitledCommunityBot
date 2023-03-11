const { questions } = require("./questions.json")
const { quotes } = require("./quotes.json")

module.exports = {
    getQOTD(prev){
        let q = questions[Math.floor(Math.random() * questions.length)].question
        while(prev == q){
            q = questions[Math.floor(Math.random() * questions.length)].question
        }
        return q
    },
    getQuote(prev){
        if(prev == null){
            prev = {
                text:"",
                author:""
            }
        }
        let q = quotes[Math.floor(Math.random() * quotes.length)]
        while(prev.text == q.text){
            q = quotes[Math.floor(Math.random() * quotes.length)]
        }
        return q
    },
    timeVal(val){
        return [
            '12:00 AM (EST)',
            '1:00 AM (EST)',
            '2:00 AM (EST)',
            '3:00 AM (EST)',
            '4:00 AM (EST)',
            '5:00 AM (EST)',
            '6:00 AM (EST)',
            '7:00 AM (EST)',
            '8:00 AM (EST)',
            '9:00 AM (EST)',
            '10:00 AM (EST)',
            '11:00 AM (EST)',
            '12:00 AM (EST)',
            '1:00 PM (EST)',
            '2:00 PM (EST)',
            '3:00 PM (EST)',
            '4:00 PM (EST)',
            '5:00 PM (EST)',
            '6:00 PM (EST)',
            '7:00 PM (EST)',
            '8:00 PM (EST)',
            '9:00 PM (EST)',
            '10:00 PM (EST)',
            '11:00 PM (EST)'
        ][val]
    },
    getTimes(){
        return [
            '12:00 AM (EST)',
            '1:00 AM (EST)',
            '2:00 AM (EST)',
            '3:00 AM (EST)',
            '4:00 AM (EST)',
            '5:00 AM (EST)',
            '6:00 AM (EST)',
            '7:00 AM (EST)',
            '8:00 AM (EST)',
            '9:00 AM (EST)',
            '10:00 AM (EST)',
            '11:00 AM (EST)',
            '12:00 AM (EST)',
            '1:00 PM (EST)',
            '2:00 PM (EST)',
            '3:00 PM (EST)',
            '4:00 PM (EST)',
            '5:00 PM (EST)',
            '6:00 PM (EST)',
            '7:00 PM (EST)',
            '8:00 PM (EST)',
            '9:00 PM (EST)',
            '10:00 PM (EST)',
            '11:00 PM (EST)'
        ]
    }
}