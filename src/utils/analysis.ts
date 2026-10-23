import type { Question, TestResult } from '../types/test'
import { sampleQuestions } from '../data/questions'

export interface SubjectAnalysis {
  subject: string
  total: number
  attempted: number
  correct: number
  incorrect: number
  accuracy: number
  score: number
}

export interface TopicAnalysis {
  topic: string
  subject: string
  attempted: number
  correct: number
  incorrect: number
  accuracy: number
}

export interface QuestionReview {
  question: Question
  userAnswer: string | number | null
  isCorrect: boolean
}

export function analyzeTestResult(result: TestResult) {
  const subjectMap = new Map<string, SubjectAnalysis>()
  const topicMap = new Map<string, TopicAnalysis>()
  const questionMap = new Map(sampleQuestions.map((q) => [q.id, q]))

  for (const question of sampleQuestions) {
    if (!subjectMap.has(question.subject)) {
      subjectMap.set(question.subject, {
        subject: question.subject,
        total: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
        score: 0,
      })
    }

    subjectMap.get(question.subject)!.total += 1
  }

  for (const answer of result.answers) {
    const question = questionMap.get(answer.questionId)

    if (!question) continue

    const subject = subjectMap.get(question.subject)!

    if (!topicMap.has(question.topic)) {
      topicMap.set(question.topic, {
        topic: question.topic,
        subject: question.subject,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
      })
    }

    const topic = topicMap.get(question.topic)!

    if (answer.answer !== null) {
      subject.attempted += 1
      topic.attempted += 1

      if (answer.answer === question.correctAnswer) {
        subject.correct += 1
        subject.score += question.marks
        topic.correct += 1
      } else {
        subject.incorrect += 1
        subject.score -= question.negativeMarks
        topic.incorrect += 1
      }
    }
  }

  const subjects = Array.from(subjectMap.values()).map((item) => ({
    ...item,
    accuracy:
      item.attempted > 0
        ? Math.round((item.correct / item.attempted) * 100)
        : 0,
  }))

  const topics = Array.from(topicMap.values())
    .map((item) => ({
      ...item,
      accuracy:
        item.attempted > 0
          ? Math.round((item.correct / item.attempted) * 100)
          : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)

  const questionReviews: QuestionReview[] = result.answers
    .map((answer) => {
      const question = questionMap.get(answer.questionId)

      if (!question) return null

      return {
        question,
        userAnswer: answer.answer,
        isCorrect: answer.answer === question.correctAnswer,
      }
    })
    .filter((item): item is QuestionReview => item !== null)

  return {
    subjects,
    topics,
    questionReviews,
    weakTopics: topics.filter(
      (topic) => topic.attempted > 0 && topic.accuracy < 60,
    ),
  }
}